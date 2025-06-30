const mongoose = require('mongoose');

const DailyTrackerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: String, required: true }, 
    weightKg: { type: Number, required: true },
    waterIntakeLiters: { type: Number, required: true },
    sleepHours: { type: Number, required: true },
    mood: { type: String, required: true },
    workoutCompletedIds: [{ type: String }],
    mealsEatenIds: [{ type: String }],
    caloriesConsumed: { type: Number },
    caloriesBurned: { type: Number },
    stepCount: { type: Number },
    stressLevel: { type: Number },
    notes: { type: String },
    goalCheckins: [{
        type: String,
    }],
    updatedAt: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('c', DailyTrackerSchema);
