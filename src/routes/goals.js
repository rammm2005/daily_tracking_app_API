const express = require('express');
const router = express.Router();
const Goal = require('../model/goal');

router.get('/user/:userId', async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.params.userId });
        res.json({ success: true, data: goals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal tidak ditemukan' });
        }
        res.json({ success: true, data: goal });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const goal = new Goal(req.body);
        await goal.save();
        res.status(201).json({ success: true, data: goal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal tidak ditemukan' });
        }
        res.json({ success: true, data: goal });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal tidak ditemukan' });
        }

        await goal.deleteOne();
        res.json({ success: true, message: 'Goal berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
