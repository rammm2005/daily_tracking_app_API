const express = require('express');
const router = express.Router();
const Tip = require('../model/tip');

router.get('/:userId', async (req, res) => {
    try {
        const tips = await Tip.find({ userId: req.params.userId });
        res.json({ success: true, tips });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newTip = new Tip(req.body);
        await newTip.save();
        res.status(201).json({ success: true, newTip });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedTip = await Tip.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTip) return res.status(404).json({ success: false, message: 'Tip not found' });
        res.json({ success: true, updatedTip });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedTip = await Tip.findByIdAndDelete(req.params.id);
        if (!deletedTip) return res.status(404).json({ success: false, message: 'Tip not found' });
        res.json({ success: true, message: 'Tip deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;
