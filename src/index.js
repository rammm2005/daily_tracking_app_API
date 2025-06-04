
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const tipRoutes = require('./routes/tips');
const mealRoutes = require('./routes/meals');
const userRoutes = require('./routes/user');
const Location = require('./model/location');
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
const showRouteOverview = require('./routes/RouteOverview');


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
app.get('/', showRouteOverview);

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



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
