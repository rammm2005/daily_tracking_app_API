const express = require('express');
const router = express.Router();
const Meal = require('../model/meal');

router.get('/:userId', async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.params.userId });
        res.json({ success: true, meals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newMeal = new Meal(req.body);
        await newMeal.save();
        res.status(201).json({ success: true, newMeal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMeal) return res.status(404).json({ success: false, message: 'Meal not found' });
        res.json({ success: true, updatedMeal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedMeal = await Meal.findByIdAndDelete(req.params.id);
        if (!deletedMeal) return res.status(404).json({ success: false, message: 'Meal not found' });
        res.json({ success: true, message: 'Meal deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
