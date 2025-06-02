const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tip = require('../model/tip');
const { uploadStreamToCloudinary } = require('../utils/cloudinaryUpload');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/:userId', async (req, res) => {
    try {
        const tips = await Tip.find({ userId: req.params.userId });
        return res.status(200).json({ success: true, tips });
    } catch (err) {
        console.error('GET /:userId error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/all/data', async (req, res) => {
    try {
        const tips = await Tip.find();
        return res.status(200).json({ success: true, tips });
    } catch (err) {
        console.error('GET /all/data error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.body.title || !req.body.content || !req.body.userId || !req.body.type) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No image files uploaded' });
        }

        const uploadResults = await Promise.all(
            req.files.map(file => uploadStreamToCloudinary(file.buffer))
        );

        const images = uploadResults.map(r => r.secure_url);

        const newTip = new Tip({
            title: req.body.title,
            content: req.body.content,
            description_short: req.body.description_short || '',
            type: req.body.type,
            userId: req.body.userId,
            images
        });

        const savedTip = await newTip.save();
        console.log('Created Tip:', savedTip);

        return res.status(201).json({ success: true, message: 'Tip created successfully', data: savedTip });
    } catch (err) {
        console.error('POST /tips error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const tip = await Tip.findById(req.params.id);
        if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });

        let images = tip.images || [];

        if (req.files && req.files.length > 0) {
            const uploadResults = await Promise.all(
                req.files.map(file => uploadStreamToCloudinary(file.buffer))
            );
            const newImages = uploadResults.map(r => r.secure_url);
            images = images.concat(newImages);
        }

        const updatedData = {
            title: req.body.title || tip.title,
            content: req.body.content || tip.content,
            description_short: req.body.description_short !== undefined ? req.body.description_short : tip.description_short,
            type: req.body.type || tip.type,
            images,
        };

        const updatedTip = await Tip.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        console.log('Updated Tip:', updatedTip);

        return res.status(200).json({ success: true, message: 'Tip updated successfully', data: updatedTip });
    } catch (err) {
        console.error('PUT /tips error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedTip = await Tip.findByIdAndDelete(req.params.id);
        if (!deletedTip) return res.status(404).json({ success: false, message: 'Tip not found' });

        return res.status(200).json({ success: true, message: 'Tip deleted successfully', data: deletedTip });
    } catch (err) {
        console.error('DELETE /tips error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
