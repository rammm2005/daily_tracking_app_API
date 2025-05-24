const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOTP(email, otp) {
    await transporter.sendMail({
        from: `"Daily Life Tracking" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Kode Verifikasi OTP',
        text: `Kode OTP Anda adalah: ${otp}`
    });
}

module.exports = sendOTP;
