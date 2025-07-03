
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const tipRoutes = require('./routes/tips');
const mealRoutes = require('./routes/meals');
const userRoutes = require('./routes/user');
const workoutRoutes = require('./routes/workout');
const reminderRoutes = require('./routes/reminder');
const goalRoutes = require('./routes/goals');
const trackerRoutes = require('./routes/progress');
const chatbotRoutes = require('./routes/chatbot');
const userFavorite = require('./routes/favorite');
const { startReminderJob } = require('./jobs/scheduleEvent');
// const Location = require('./model/location');
const showRouteOverview = require('./routes/routeOverview');
// let fetch;
// (async () => {
//   fetch = (await import('node-fetch')).default;
// })();


const app = express();
const PORT = process.env.PORT || 100;
const MONGO_URI = process.env.DB_URL;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/favorite', userFavorite);
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, Mat Datang di API TRACKING APP DAILY.....' });
});
app.get('/', showRouteOverview);

startReminderJob();
// app.get('/', async (req, res) => {
//   const ip = req.headers['x-forwarded-for']?.split(',').shift() ||
//     req.socket?.remoteAddress ||
//     req.connection?.remoteAddress ||
//     'IP tidak diketahui';
//   '';

//   try {
//     const response = await fetch(`http://ip-api.com/json/${ip}`);
//     const data = await response.json();
//     console.log(data)

//     if (data.status) {
//       await Location.create({
//         ip,
//         country: data.country,
//         region: data.regionName,
//         city: data.city,
//         zip: data.zip,
//         lat: data.lat,
//         lon: data.lon,
//         isp: data.isp,
//       });

//       res.json({
//         message: 'Selamat datang di Tracker App Daily — solusi pintar untuk melacak aktivitas harianmu!',
//         yourIp: ip,
//         location: {
//           country: data.country,
//           region: data.regionName,
//           city: data.city,
//           zip: data.zip,
//           lat: data.lat,
//           lon: data.lon,
//           isp: data.isp,
//         }
//       });
//     } else {
//       res.json({
//         message: 'Selamat datang di Tracker App Daily — solusi pintar untuk melacak aktivitas harianmu!',
//         yourIp: ip,
//         location: 'Tidak dapat mendeteksi lokasi'
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching location:', error);
//     res.json({
//       message: 'Selamat datang di Tracker App Daily — solusi pintar untuk melacak aktivitas harianmu!',
//       yourIp: ip,
//       location: 'Terjadi kesalahan saat mengambil lokasi'
//     });
//   }
// });



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
