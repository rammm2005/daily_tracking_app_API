const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  calories: { type: Number, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Meal', MealSchema);
