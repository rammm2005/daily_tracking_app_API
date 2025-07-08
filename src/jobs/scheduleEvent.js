const cron = require('node-cron');
const Reminder = require('../model/reminder');
const sendEmail = require('../utils/send-email');

function startReminderJob() {
    cron.schedule('* * * * *', async () => {
        console.log('⏰ [CRON] Checking reminders to notify...');

        const now = new Date();
        const threshold = new Date(now.getTime() + 30 * 60 * 1000); // 30 menit ke depan
        const nowDateStr = now.toISOString().split('T')[0];
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();
        const nowDay = now.getDay(); // 0 = Sunday
        const nowDate = now.getDate();

        try {
            const remindersToNotify = await Reminder.find({
                status: 'active',
                schedule: { $exists: true, $ne: null, $ne: '' }
            }).populate('userId');

            if (!remindersToNotify.length) {
                console.log('ℹ️ No reminders to notify this minute.');
                return;
            }

            for (const reminder of remindersToNotify) {
                if (!reminder.userId?.email) {
                    console.warn(`⚠️ No email found for user ${reminder.userId?._id}`);
                    continue;
                }
                const email = reminder.userId.email;

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

                const recurrence = reminder.recurrence || 'once';

                switch (recurrence) {
                    case 'once':
                        if (!reminder.notified && isNormalWindow) {
                            await kirimSekali(reminder, email, reminderTime);
                        }
                        break;

                    case 'daily':
                        if (nowHour === reminderTime.getHours() && nowMinute === reminderTime.getMinutes()) {
                            await kirimDaily(reminder, email);
                        }
                        break;

                    case 'weekly':
                        if (nowDay === reminderTime.getDay() &&
                            nowHour === reminderTime.getHours() &&
                            nowMinute === reminderTime.getMinutes()) {
                            await kirimWeekly(reminder, email);
                        }
                        break;

                    case 'monthly':
                        if (nowDate === reminderTime.getDate() &&
                            nowHour === reminderTime.getHours() &&
                            nowMinute === reminderTime.getMinutes()) {
                            await kirimMonthly(reminder, email);
                        }
                        break;

                    default:
                        console.warn(`⚠️ Unknown recurrence: ${recurrence}`);
                        break;
                }
            }

        } catch (err) {
            console.error(`🔥 [CRON ERROR] Failed to process reminders: ${err.message}`);
        }
    });
}

// helpers
async function kirimDaily(reminder, email) {
    try {
        await sendEmail(
            email,
            `📅 Pengingat Harian: "${reminder.title}"`,
            `
            Halo,<br>
            Ini adalah <b>pengingat harian</b> untuk <b>"${reminder.title}"</b>.<br><br>
            Salam,<br>
            Gym App
            `
        );
        console.log(`✅ Daily sent to ${email} for "${reminder.title}"`);
    } catch (err) {
        console.error(`❌ Failed daily to ${email}: ${err.message}`);
    }
}

async function kirimWeekly(reminder, email) {
    try {
        await sendEmail(
            email,
            `📅 Pengingat Mingguan: "${reminder.title}"`,
            `
            Halo,<br>
            Ini adalah <b>pengingat mingguan</b> untuk <b>"${reminder.title}"</b>.<br><br>
            Salam,<br>
            Gym App
            `
        );
        console.log(`✅ Weekly sent to ${email} for "${reminder.title}"`);
    } catch (err) {
        console.error(`❌ Failed weekly to ${email}: ${err.message}`);
    }
}

async function kirimMonthly(reminder, email) {
    try {
        await sendEmail(
            email,
            `📅 Pengingat Bulanan: "${reminder.title}"`,
            `
            Halo,<br>
            Ini adalah <b>pengingat bulanan</b> untuk <b>"${reminder.title}"</b>.<br><br>
            Salam,<br>
            Gym App
            `
        );
        console.log(`✅ Monthly sent to ${email} for "${reminder.title}"`);
    } catch (err) {
        console.error(`❌ Failed monthly to ${email}: ${err.message}`);
    }
}

async function kirimSekali(reminder, email, waktu) {
    try {
        await sendEmail(
            email,
            `📅 Reminder: "${reminder.title}" starts soon`,
            `
            Halo,<br>
            Pengingat Anda <b>"${reminder.title}"</b> dijadwalkan pada jam ${waktu.toLocaleTimeString('id-ID')}.<br><br>
            Salam,<br>
            Gym App
            `
        );
        reminder.notified = true;
        await reminder.save();

        console.log(`✅ Once sent to ${email} for "${reminder.title}"`);
    } catch (err) {
        console.error(`❌ Failed once to ${email}: ${err.message}`);
    }
}

module.exports = { startReminderJob };
