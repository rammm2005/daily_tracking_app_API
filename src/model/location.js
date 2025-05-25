const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  ip: String,
  country: String,
  region: String,
  city: String,
  zip: String,
  lat: Number,
  lon: Number,
  isp: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Location', LocationSchema);