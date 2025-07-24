// File: backend/models/Product.js (updated)

const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['image', 'video']
  },
  url: {
    type: String,
    required: true
  }
}, { _id: false });


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  media: {
    type: [mediaSchema],
    required: true,
    validate: [
        function(arr) {
            return Array.isArray(arr) && arr.length > 0 && arr[0].type === 'image';
        }, 
        'Product must have at least one media item, and the first item must be an image.'
    ]
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  // --- NEW FIELD FOR THE HOMEPAGE BANNER ---
  isFeatured: {
    type: Boolean,
    default: false
  }
  // --- END OF NEW FIELD ---
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
