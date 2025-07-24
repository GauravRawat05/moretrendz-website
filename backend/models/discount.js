// File: backend/models/Discount.js

const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Each discount code must be unique
    uppercase: true, // Automatically convert the code to uppercase
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true // Codes are active by default when created
  }
}, {
  timestamps: true
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
