// File: backend/routes/adminAuthRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

// Protected route example
router.get('/admin-protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: `Welcome Admin: ${decoded.email}` });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
