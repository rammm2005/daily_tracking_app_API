const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, html) {
    const mailOptions = {
        from: `"Daily Tracking Me" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.response}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send email to ${to}:`, err.message);
        return false;
    }
}

module.exports = sendEmail;
