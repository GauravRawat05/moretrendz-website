// File: backend/routes/productRoutes.js (updated)

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// --- NEW: SEARCH FOR PRODUCTS ---
// GET /api/products/search?q=...
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q; // Get the search query from the URL
        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Perform a case-insensitive search on the product name and description
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.json(products);

    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ message: 'Server error while searching' });
    }
});


// --- CREATE A PRODUCT (POST /api/products) ---
router.post('/', async (req, res) => {
  try {
    const { name, description, price, media, isFeatured } = req.body;
    if (isFeatured) {
        await Product.updateMany({}, { isFeatured: false });
    }
    const newProduct = new Product({ 
        name, description, price, media, isFeatured
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// --- GET ALL PRODUCTS (GET /api/products) ---
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    const featuredProduct = await Product.findOne({ isFeatured: true });
    res.json({ products, featuredProduct });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// --- GET A SINGLE PRODUCT & RELATED PRODUCTS ---
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const relatedProducts = await Product.find({ _id: { $ne: req.params.id } }).limit(4);
        res.json({ product, relatedProducts });
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DELETE A PRODUCT (DELETE /api/products/:id) ---
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
});

module.exports = router;
