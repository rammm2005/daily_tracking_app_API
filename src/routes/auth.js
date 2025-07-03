const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOTP = require('../utils/send-otp');

const JWT_SECRET = process.env.JWT_SECRET;


const generateOTP = () => crypto.randomInt(100000, 999999).toString();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, height_cm, weight_kg, goal, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = new User({
      name,
      email,
      passwordHash,
      age,
      gender,
      height_cm,
      weight_kg,
      goal,
      role: role || 'user',
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    await user.save();
    await sendOTP(email, otp);

    res.json({ success: true, message: 'Registrasi berhasil. Silakan verifikasi OTP yang dikirim ke email Anda.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: 'User tidak ditemukan' });
  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Akun diblokir' });

  if (user.otpCode !== otp || user.otpExpires < Date.now()) {
    user.otpAttempts += 1;

    if (user.otpAttempts >= 3) {
      user.isBlocked = true;
    }

    await user.save();
    return res.status(400).json({ success: false, message: 'OTP salah atau kadaluarsa' });
  }

  user.isVerified = true;
  user.otpCode = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  await user.save();

  res.json({
    success: true,
    message: 'OTP berhasil diverifikasi. Silakan login.',
    role: user.role,
  });
});

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.isVerified) return res.status(400).json({ success: false, message: 'Permintaan tidak valid' });

  const otp = generateOTP();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();
  await sendOTP(email, otp);

  res.json({ success: true, message: 'OTP baru telah dikirim ke email' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Email atau password salah' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Email atau password salah' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });

  const otp = generateOTP();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();

  await sendOTP(email, otp);

  res.json({ success: true, message: 'OTP untuk reset password telah dikirim ke email' });
});


router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });

  if (user.otpCode !== otp || user.otpExpires < Date.now()) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= 3) {
      user.isBlocked = true;
    }
    await user.save();
    return res.status(400).json({ success: false, message: 'OTP salah atau kadaluarsa' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  user.passwordHash = passwordHash;
  user.otpCode = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  await user.save();

  res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' });
});


module.exports = router;
