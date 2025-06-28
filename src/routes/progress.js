const express = require('express');
const router = express.Router();
const DailyTracker = require('../model/progress');

router.get('/user/:userId', async (req, res) => {
    try {
        const trackers = await DailyTracker.find({ userId: req.params.userId });
        res.json({ success: true, data: trackers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const tracker = await DailyTracker.findById(req.params.id);
        if (!tracker) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }
        res.json({ success: true, data: tracker });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const tracker = new DailyTracker(req.body);
        await tracker.save();
        res.status(201).json({ success: true, data: tracker });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}); 

router.put('/:id', async (req, res) => {
    try {
        const tracker = await DailyTracker.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tracker) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }
        res.json({ success: true, data: tracker });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const tracker = await DailyTracker.findById(req.params.id);
        if (!tracker) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        }

        await tracker.deleteOne();
        res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
