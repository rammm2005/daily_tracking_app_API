const express = require('express');
const router = express.Router();
const Workout = require('../model/workout');
const multer = require('multer');
const { uploadStreamToCloudinary } = require('../utils/cloudinaryUpload');
const { extractPublicId } = require('../utils/extractPublicId');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/all', async (req, res) => {
    try {
        const workouts = await Workout.find();
        res.json({ success: true, data: workouts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout tidak ditemukan' });
        }
        res.json({ success: true, data: workout });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', upload.single('pic'), async (req, res) => {
    try {
        const { title, description, category, kcal, difficulty, video_url, durationAll, lessons } = req.body;

        if (!title || !req.file) {
            return res.status(400).json({ success: false, message: 'Judul dan gambar wajib diisi.' });
        }

        const result = await uploadStreamToCloudinary(req.file.buffer, 'workouts');

        const workout = new Workout({
            title,
            description,
            category,
            picPath: result.secure_url,
            kcal,
            difficulty,
            video_url,
            durationAll,
            lessons: lessons ? JSON.parse(lessons) : []
        });

        await workout.save();
        res.status(201).json({ success: true, data: workout });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', upload.single('pic'), async (req, res) => {
    try {
        const { title, description, category, kcal, difficulty, video_url, durationAll, lessons } = req.body;
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout tidak ditemukan' });
        }

        if (req.file) {
            if (workout.picPath) {
                const publicId = extractPublicId(workout.picPath);
                if (publicId) {
                    await cloudinary.api.delete_resources([publicId], {
                        type: 'upload',
                        resource_type: 'image'
                    });
                }
            }

            const result = await uploadStreamToCloudinary(req.file.buffer, 'workouts');
            workout.picPath = result.secure_url;
        }

        workout.title = title || workout.title;
        workout.description = description || workout.description;
        workout.category = category || workout.category;
        workout.kcal = kcal || workout.kcal;
        workout.difficulty = difficulty || workout.difficulty;
        workout.video_url = video_url || workout.video_url;
        workout.durationAll = durationAll || workout.durationAll;
        workout.lessons = lessons ? JSON.parse(lessons) : workout.lessons;

        await workout.save();
        res.json({ success: true, data: workout });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout tidak ditemukan' });
        }

        if (workout.picPath) {
            const publicId = extractPublicId(workout.picPath);
            if (publicId) {
                await cloudinary.api.delete_resources([publicId], {
                    type: 'upload',
                    resource_type: 'image'
                });
            }
        }

        await workout.deleteOne();
        res.json({ success: true, message: 'Workout berhasil dihapus' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
