// File: backend/models/Order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageURL: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const shippingDetailsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    shippingDetails: shippingDetailsSchema,
    orderItems: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Online', 'COD']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed'],
        default: 'Pending' // An order is pending until payment is confirmed
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
