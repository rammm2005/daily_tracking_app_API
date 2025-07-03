const cron = require('node-cron');
const Reminder = require('../model/reminder');
const sendEmail = require('../utils/send-email');

function startReminderJob() {
    cron.schedule('* * * * *', async () => {
        console.log("⏰ [CRON] Checking reminders to notify...");

        const now = new Date();
        const threshold = new Date(now.getTime() + 30 * 60 * 1000); // 30 menit ke depan
        const lateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 jam yg lalu
        const nowDateStr = now.toISOString().split('T')[0];
        const hour = now.getHours();
        const isWorkingHour = hour >= 8 && hour <= 17;

        try {
            const remindersToNotify = await Reminder.find({
                status: 'active',
                notified: false,
                schedule: { $exists: true }
            }).populate('userId');

            if (!remindersToNotify.length) {
                console.log("ℹ️ No reminders to notify this minute.");
                return;
            }

            for (const reminder of remindersToNotify) {
                let reminderTime;

                if (reminder.schedule.includes('-')) {
                    const [startTimeStr] = reminder.schedule.split('-');
                    reminderTime = new Date(startTimeStr.trim());
                } else {
                    reminderTime = new Date(reminder.schedule.trim());
                }

                if (isNaN(reminderTime.getTime())) {
                    console.warn(`⚠️ Invalid date in reminder: ${reminder._id}, schedule="${reminder.schedule}"`);
                    continue;
                }

                const reminderDateStr = reminderTime.toISOString().split('T')[0];

                const isNormalWindow = reminderTime >= now && reminderTime <= threshold;
                const isLateWindow = reminderTime < now && reminderTime >= lateLimit;

                const hasTimePart = reminder.schedule.includes(':');

                if (hasTimePart) {
                    if (isNormalWindow || isLateWindow) {
                        const lateTag = isLateWindow ? "[LATE] " : "";

                        if (reminder.method.includes('Email')) {
                            if (reminder.userId?.email) {
                                try {
                                    await sendEmail(
                                        reminder.userId.email,
                                        `${lateTag}📅 Reminder: "${reminder.title}" starts soon`,
                                        `
                                            Hi,<br>
                                            Just a friendly reminder that your reminder <b>"${reminder.title}"</b> was scheduled at ${reminderTime.toLocaleTimeString()}.<br><br>
                                            Regards,<br>
                                            Gym App
                                        `
                                    );

                                    reminder.notified = true;
                                    await reminder.save();

                                    console.log(`✅ ${lateTag}Email sent & marked notified to ${reminder.userId.email} for "${reminder.title}"`);
                                } catch (err) {
                                    console.error(`❌ Failed to notify ${reminder.userId.email}:`, err.message);
                                }
                            } else {
                                console.warn(`⚠️ User email not found for userId=${reminder.userId?._id}`);
                            }
                        }
                    }
                } else {
                    if (reminderDateStr === nowDateStr && isWorkingHour) {
                        if (reminder.method.includes('Email')) {
                            if (reminder.userId?.email) {
                                try {
                                    await sendEmail(
                                        reminder.userId.email,
                                        `📅 Reminder: "${reminder.title}" for today`,
                                        `
                                            Hi,<br>
                                            Just a friendly reminder that your reminder <b>"${reminder.title}"</b> is scheduled for today (${reminderDateStr}).<br><br>
                                            Regards,<br>
                                            Gym App
                                        `
                                    );

                                    reminder.notified = true;
                                    await reminder.save();

                                    console.log(`✅ Email sent & marked notified to ${reminder.userId.email} for "${reminder.title}"`);
                                } catch (err) {
                                    console.error(`❌ Failed to notify ${reminder.userId.email}:`, err.message);
                                }
                            } else {
                                console.warn(`⚠️ User email not found for userId=${reminder.userId?._id}`);
                            }
                        }
                    }
                }
            }

        } catch (err) {
            console.error("🔥 [CRON ERROR] Failed to process reminders:", err.message);
        }
    });
}

module.exports = { startReminderJob };
