const express = require('express');
const router = express.Router();
const Reminder = require('../model/reminder');

router.get('/user/:userId', async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.params.userId });
        res.json({ success: true, data: reminders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder tidak ditemukan' });
        }
        res.json({ success: true, data: reminder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, type, title, schedule, method, days, description, status, repeat } = req.body;

        if (!userId || !type || !title || !schedule || !method || !days) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }

        const reminder = new Reminder({
            userId,
            type,
            title,
            schedule,
            method,
            days,
            description,
            status: status || 'active',
            repeat: repeat || 'none',
        });

        await reminder.save();
        res.status(201).json({ success: true, data: reminder });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { type, title, schedule, method, days, description, status, repeat } = req.body;

        const reminder = await Reminder.findById(req.params.id);
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder tidak ditemukan' });
        }

        reminder.type = type || reminder.type;
        reminder.title = title || reminder.title;
        reminder.schedule = schedule || reminder.schedule;
        reminder.method = method || reminder.method;
        reminder.description = description || reminder.description;
        reminder.days = days || reminder.days;
        reminder.status = status || reminder.status;
        reminder.repeat = repeat || reminder.repeat;

        await reminder.save();
        res.json({ success: true, data: reminder });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder tidak ditemukan' });
        }

        await reminder.deleteOne();
        res.json({ success: true, message: 'Reminder berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
