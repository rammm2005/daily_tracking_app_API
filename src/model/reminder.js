const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    schedule: {
        type: String, // format: '2025-06-25 10:30:00'
        required: true,
    },
    method: {
        type: [String], // e.g., ['email', 'notification']
        required: true,
    },
    days: {
        type: [String], // e.g., ['Monday', 'Wednesday']
        required: true,
    },
    status: {
        type: String,
        default: 'active',
    },
    repeat: {
        type: String,
        default: 'none',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Reminder', ReminderSchema);
