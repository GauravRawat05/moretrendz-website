// File: backend/routes/adminAuthRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuthMiddleware'); // <-- ADD THIS LINE
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@moretrendz.online';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GSRHR87H7313';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Admin Login
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

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
        const formData = new FormData();
        formData.append('image', req.file.buffer.toString('base64')); // Send as base64

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData, {
            headers: formData.getHeaders()
        });

        if (response.data.success) {
            res.json({ success: true, url: response.data.data.url });
        } else {
            throw new Error(response.data.error.message);
        }
    } catch (error) {
        console.error('ImgBB upload error:', error.message);
        res.status(500).json({ message: 'Error uploading image to provider.' });
    }
});

module.exports = router;