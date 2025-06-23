const express = require('express');
const router = express.Router();
const Meal = require('../model/meal');
const multer = require('multer');
const { uploadStreamToCloudinary } = require('../utils/cloudinaryUpload');
const cloudinary = require('cloudinary').v2;
const { extractPublicId } = require('../utils/extractPublicId');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/:userId', async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.params.userId });
        res.json({ success: true, meals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/detail/:id', async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        if (!meal) {
            return res.status(404).json({ success: false, message: `Meal dengan id ${req.params.id} tidak ditemukan.` });
        }
        return res.status(200).json({ success: true, data: meal, message: `Success, Get Meal With Id : ${req.params.id}` });
    } catch (err) {
        console.error('GET /:id error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/all/data', async (req, res) => {
    try {
        const meals = await Meal.find();
        return res.status(200).json({ success: true, data: meals, message: 'Success Load All Data Meals' });
    } catch (err) {
        console.error('GET /all/data error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/', upload.single('meal'), async (req, res) => {
    try {
        const { title, calories, description, ingredients, category, userId } = req.body;

        if (!title || !calories || !category || !userId || !description || !ingredients || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi, termasuk gambar.'
            });
        }

        const result = await uploadStreamToCloudinary(req.file.buffer, 'meals');
        const imageUrl = result.secure_url;

        const newMeal = new Meal({
            title,
            calories,
            description,
            ingredients,
            category,
            userId,
            image: imageUrl
        });

        await newMeal.save();
        res.status(201).json({ success: true, newMeal });

    } catch (err) {
        console.error('POST / error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});


router.put('/:id', upload.single('meal'), async (req, res) => {
    try {
        const { title, calories, description, ingredients, category, userId } = req.body;

        if (!title || !calories || !category || !userId || !description || !ingredients) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi.'
            });
        }

        const updateData = {
            title,
            calories,
            description,
            ingredients,
            category,
            userId
        };

        const existingMeal = await Meal.findById(req.params.id);
        if (!existingMeal) {
            return res.status(404).json({ success: false, message: 'Meal tidak ditemukan' });
        }

        if (req.file) {
            if (existingMeal.image) {
                const publicId = extractPublicId(existingMeal.image);
                if (publicId) {
                    await cloudinary.api.delete_resources([publicId], {
                        type: 'upload',
                        resource_type: 'image'
                    });
                }
            }

            const result = await uploadStreamToCloudinary(req.file.buffer, 'meals');
            updateData.image = result.secure_url;
        }

        const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, updateData, { new: true });
        return res.json({ success: true, updatedMeal });

    } catch (err) {
        console.error('updateMealWithImage error:', err);
        return res.status(400).json({ success: false, message: err.message });
    }
});



router.delete('/:id', async (req, res) => {
    try {
        const existingMeal = await Meal.findById(req.params.id);
        if (!existingMeal) {
            return res.status(404).json({ success: false, message: 'Meal tidak ditemukan' });
        }

        if (existingMeal.image) {
            const publicId = extractPublicId(existingMeal.image);
            if (publicId) {
                await cloudinary.api.delete_resources([publicId], {
                    type: 'upload',
                    resource_type: 'image'
                });
            }
        }

        await Meal.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Meal dan gambar berhasil dihapus' });
    } catch (err) {
        console.error('Delete Meal Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
