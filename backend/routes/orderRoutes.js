// File: backend/routes/orderRoutes.js

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');

// Import ALL notification services
const { sendTelegramNotification, logOrderToGoogleSheet } = require('../services/notificationService');
const { sendOrderConfirmationEmail } = require('../services/emailService'); // <-- ADD THIS LINE

// --- RAZORPAY CONFIGURATION ---
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
    throw new Error("🛑 Missing Razorpay API keys in .env file");
}

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET,
});

// --- UNIFIED ORDER CREATION ROUTE ---
router.post('/create', async (req, res) => {
    try {
        const { shippingDetails, orderItems, totalAmount, paymentMethod } = req.body;

        if (!shippingDetails || !orderItems || !totalAmount || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required order fields.' });
        }

        if (paymentMethod === 'COD') {
            const newOrder = new Order({
                shippingDetails,
                orderItems,
                totalAmount,
                paymentMethod,
                paymentStatus: 'Processing'
            });
            const savedOrder = await newOrder.save();
            
            // --- Send all notifications for COD orders ---
            sendTelegramNotification(savedOrder);
            logOrderToGoogleSheet(savedOrder);
            sendOrderConfirmationEmail(savedOrder); // <-- ADD THIS LINE
            
            return res.status(201).json({ dbOrder: savedOrder });
        }

        if (paymentMethod === 'Online') {
            const razorpayOptions = {
                amount: totalAmount * 100,
                currency: 'INR',
                receipt: `receipt_order_${new Date().getTime()}`
            };
            const razorpayOrder = await razorpay.orders.create(razorpayOptions);

            const newOrder = new Order({
                shippingDetails,
                orderItems,
                totalAmount,
                paymentMethod,
                paymentStatus: 'Pending',
                razorpayOrderId: razorpayOrder.id
            });
            const savedOrder = await newOrder.save();
            
            return res.status(201).json({
                dbOrder: savedOrder,
                razorpayOrder: razorpayOrder
            });
        }

    } catch (error) {
        console.error('❌ Error in /create route:', error);
        res.status(500).json({ message: 'Server error while creating order.' });
    }
});


// --- PAYMENT VERIFICATION ROUTE ---
router.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
        return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_SECRET) 
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        await Order.findByIdAndUpdate(dbOrderId, { paymentStatus: 'Failed' });
        return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(dbOrderId, {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentStatus: 'Paid'
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found in database.' });
        }

        // --- Send all notifications for successful online orders ---
        sendTelegramNotification(updatedOrder);
        logOrderToGoogleSheet(updatedOrder);
        sendOrderConfirmationEmail(updatedOrder); // <-- ADD THIS LINE

        res.status(200).json({ success: true, message: 'Payment verified successfully.' });

    } catch (error) {
        console.error('❌ Error updating order after payment verification:', error);
        res.status(500).json({ message: 'Server error while updating order.' });
    }
});


// --- ADMIN ROUTES ---
// (These remain unchanged)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// --- GET A SINGLE ORDER'S DETAILS ---
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching single order:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
});


module.exports = router;
