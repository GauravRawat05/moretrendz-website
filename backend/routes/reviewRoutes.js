// In backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { isAdmin } = require('./adminAuthMiddleware');
const { isAdmin } = require('../middleware/adminAuthMiddleware');

// Add this to backend/routes/reviewRoutes.js
// Make sure you import your admin authentication middleware, e.g., const { isAdmin } = require('./adminAuthMiddleware');

// POST a new review as an admin
router.post('/admin', isAdmin, async (req, res) => { // Uncomment isAdmin to protect the route
    const { productId, author, rating, text } = req.body;

    if (!productId || !author || !rating || !text) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newReview = new Review({
            productId,
            author,
            rating,
            text
        });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review' });
    }
});

// GET all reviews for a specific product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

module.exports = router;