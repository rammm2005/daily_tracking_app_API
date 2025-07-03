const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tip' }],
    workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
    meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
}, { timestamps: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
