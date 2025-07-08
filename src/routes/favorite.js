const express = require('express');
const router = express.Router();
const Favorite = require('../model/favorite');

const populateFavorite = async (favoriteId) => {
    const fav = await Favorite.findById(favoriteId)
        .populate('tips')
        .populate('workouts')
        .populate('meals');

    if (fav) {
        fav.tips = fav.tips || [];
        fav.workouts = fav.workouts || [];
        fav.meals = fav.meals || [];
    }

    return fav;
};

router.get('/user/:userId', async (req, res) => {
    try {
        let favorites = await Favorite.findOne({ userId: req.params.userId })
            .populate('tips')
            .populate('workouts')
            .populate('meals');

        if (!favorites) {
            favorites = {
                userId: req.params.userId,
                tips: [],
                workouts: [],
                meals: []
            };
        } else {
            favorites.tips = favorites.tips || [];
            favorites.workouts = favorites.workouts || [];
            favorites.meals = favorites.meals || [];
        }

        res.json({ success: true, data: [favorites] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const { userId, tipId, workoutId, mealId } = req.body;
        let favorite = await Favorite.findOne({ userId });

        if (!favorite) {
            favorite = new Favorite({
                userId,
                tips: tipId ? [tipId] : [],
                workouts: workoutId ? [workoutId] : [],
                meals: mealId ? [mealId] : []
            });
        } else {
            if (tipId && !favorite.tips.includes(tipId)) favorite.tips.push(tipId);
            if (workoutId && !favorite.workouts.includes(workoutId)) favorite.workouts.push(workoutId);
            if (mealId && !favorite.meals.includes(mealId)) favorite.meals.push(mealId);
        }

        await favorite.save();
        const populatedFavorite = await populateFavorite(favorite._id);

        res.status(201).json({ success: true, data: populatedFavorite });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/remove', async (req, res) => {
    try {
        const { userId, tipId, workoutId, mealId } = req.body;
        const favorite = await Favorite.findOne({ userId });

        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Favorite not found' });
        }

        if (tipId) favorite.tips.pull(tipId);
        if (workoutId) favorite.workouts.pull(workoutId);
        if (mealId) favorite.meals.pull(mealId);

        await favorite.save();
        const populatedFavorite = await populateFavorite(favorite._id);

        res.json({ success: true, data: populatedFavorite });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:userId', async (req, res) => {
    try {
        const result = await Favorite.deleteOne({ userId: req.params.userId });
        res.json({ success: true, deleted: result.deletedCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
