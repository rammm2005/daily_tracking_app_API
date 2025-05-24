const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    type: { type: String, required: true },
    targetWeight: { type: Number, required: true },
    startDate: { type: String },
    endDate: { type: String },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height_cm: { type: Number, required: true },
    weight_kg: { type: Number, required: true },
    favoriteWorkouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
    favoriteMeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
    goal: goalSchema,
    role: { type: String, default: 'user' },
    otpCode: String,
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
