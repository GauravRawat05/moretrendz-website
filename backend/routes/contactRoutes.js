// File: backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { sendContactFormNotification } = require('../services/notificationService');

router.post('/submit', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        // Send notification without waiting for it to finish
        sendContactFormNotification(req.body); 
        res.status(200).json({ message: 'Message received successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;