const express = require('express');
const router = express.Router();
const User = require('../model/user');

router.get('/email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, userId: user._id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/email/:email', async (req, res) => {
    try {
        const email = req.params.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const {
            name,
            age,
            gender,
            height_cm,
            weight_kg,
        } = req.body;

        if (name !== undefined) user.name = name;
        if (age !== undefined) user.age = age;
        if (gender !== undefined) user.gender = gender;
        if (height_cm !== undefined) user.height_cm = height_cm;
        if (weight_kg !== undefined) user.weight_kg = weight_kg;

        await user.save();

        res.json({ success: true, message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



module.exports = router;
