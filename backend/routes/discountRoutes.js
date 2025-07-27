// File: backend/routes/discountRoutes.js

const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount.js');

// --- CREATE A NEW DISCOUNT CODE (for Admin) ---
// POST /api/discounts
router.post('/', async (req, res) => {
    try {
        const { code, discountPercentage } = req.body;
        const newDiscount = new Discount({ code, discountPercentage });
        const savedDiscount = await newDiscount.save();
        res.status(201).json(savedDiscount);
    } catch (error) {
        console.error("Error creating discount code:", error);
        // Handle specific error for duplicate codes
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This discount code already exists.' });
        }
        res.status(500).json({ message: 'Server error while creating discount code' });
    }
});

// --- VALIDATE A DISCOUNT CODE (for Checkout) ---
// POST /api/discounts/validate
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });

        if (discount) {
            // If the code is found and active, send back its details
            res.json({ 
                isValid: true, 
                discountPercentage: discount.discountPercentage 
            });
        } else {
            // If the code is not found or not active, send back an invalid response
            res.json({ 
                isValid: false, 
                message: 'Invalid or expired discount code.' 
            });
        }
    } catch (error) {
        console.error("Error validating discount code:", error);
        res.status(500).json({ message: 'Server error while validating code' });
    }
});

// --- GET ALL DISCOUNT CODES (for Admin) ---
// GET /api/discounts
router.get('/', async (req, res) => {
    try {
        const discounts = await Discount.find({});
        res.json(discounts);
    } catch (error) {
        console.error("Error fetching discount codes:", error);
        res.status(500).json({ message: 'Server error while fetching codes' });
    }
});

// --- DELETE A DISCOUNT CODE (for Admin) ---
// DELETE /api/discounts/:id
router.delete('/:id', async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);
        if (!discount) {
            return res.status(404).json({ message: 'Discount code not found' });
        }
        res.json({ message: 'Discount code deleted successfully' });
    } catch (error) {
        console.error("Error deleting discount code:", error);
        res.status(500).json({ message: 'Server error while deleting code' });
    }
});


module.exports = router;
