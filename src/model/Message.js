const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('Message', MessageSchema);