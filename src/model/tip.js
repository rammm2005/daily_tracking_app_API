const mongoose = require('mongoose');

const TipSchema = new mongoose.Schema({
    images: [{ type: String, required: true }],
    title: { type: String, required: true },
    content: { type: String, required: true },
    description_short: { type: String },
    type: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tip', TipSchema);