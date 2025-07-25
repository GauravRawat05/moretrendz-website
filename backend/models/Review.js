const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // This links the review to a product
        required: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;