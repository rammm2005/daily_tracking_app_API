const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    type: { type: String, enum: ['DAILY', 'WEEKLY', 'CUSTOM'], required: true },
    targetValue: { type: Number },
    unit: { type: String },
    category: { type: String, enum: ['FITNESS', 'NUTRITION', 'WELLNESS', 'HABIT', 'OTHER', 'PERFORMANCE'], required: true },
    startDate: { type: String, required: true }, 
    endDate: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
