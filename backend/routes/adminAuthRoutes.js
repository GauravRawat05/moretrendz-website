// File: backend/routes/adminAuthRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuthMiddleware');
const multer = require('multer');
const axios = require('axios');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
    console.error("FATAL ERROR: Missing required admin environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET).");
}

// Admin Login
router.post('/admin-login', (req, res) => {
    const { email, password } = req.body;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
        return res.status(500).json({ message: 'Server misconfiguration: Missing admin credentials.' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token });
    }

    res.status(401).json({ message: 'Invalid credentials' });
});

// The 'isAdmin' function is now defined because of the import at the top
router.get('/admin-protected', isAdmin, (req, res) => {
    res.json({ message: `Welcome Admin: ${req.user.email}` });
});

router.post('/upload-image', isAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    try {
        // The ImgBB API expects the image as a URL-encoded base64 string.
        const imageAsBase64 = req.file.buffer.toString('base64');
        const url = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`;
        const data = `image=${encodeURIComponent(imageAsBase64)}`;

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.success) {
            res.json({ success: true, url: response.data.data.url });
        } else {
            // This will pass any error message from ImgBB back to the frontend
            throw new Error(response.data.error.message || 'Unknown error from image provider');
        }
    } catch (error) {
        console.error('ImgBB upload error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message || 'Error uploading image to provider.' });
    }
});

module.exports = router;