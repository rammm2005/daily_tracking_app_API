const mongoose = require('mongoose');

const LessionSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    duration: String
}, { _id: true });

const WorkoutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    picPath: String,
    kcal: Number,
    difficulty: String,
    video_url: String,
    durationAll: String,
    lessons: [LessionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);
