const mongoose = require('mongoose');
const Message = require('./Message');

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startedAt: { type: Date, default: Date.now },
  title: { type: String }, 
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
