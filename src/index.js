
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const tipRoutes = require('./routes/tips');
const mealRoutes = require('./routes/meals');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.DB_URL;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, Mat Datang di API TRACKING APP DAILY.....' });
});
app.get('/', (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',').shift() ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    'IP tidak diketahui';

  res.json({
    message: 'Selamat datang di Tracker App Daily — solusi pintar untuk melacak aktivitas harianmu dengan mudah dan efektif!',
    yourIp: ip
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
