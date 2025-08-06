// File: backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

// --- UPDATED CORS POLICY ---
// This list contains all the URLs that are allowed to make requests to your backend.
const allowedOrigins = [
  'https://moretrendz.online',      // Your live frontend
  'https://www.moretrendz.online',
  'http://localhost:5173'         // Your local Vite development server
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
app.use(cors(corsOptions));
// --- END OF UPDATE ---

app.use(helmet()); 
app.use(mongoSanitize()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// --- Routes ---
const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');
const orderRoutes = require('./routes/orderRoutes');
const discountRoutes = require('./routes/discountRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api', adminAuthRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// --- Server + DB Startup ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('Missing MONGO_URI in .env');
    if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET in .env');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server: ', err.message);
    process.exit(1);
  }
};

// Add this simple route to server.js
app.get('/api/health', (req, res) => {
  res.status(200).send('Server is healthy and awake!');
});

startServer();
