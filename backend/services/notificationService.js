// File: backend/services/notificationService.js

const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send real-time Telegram notification for orders (COD or Online via Razorpay)
 */
async function sendTelegramNotification(order) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram credentials not set, skipping notification.');
        return;
    }

    try {
        const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const productList = (order.orderItems || []).map((item, idx) => {
            const itemPrice = typeof item.price === 'number' ? item.price.toFixed(2) : item.price;
            const itemTotal = typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : '';
            return `${idx + 1}. *${item.name}*\n   Qty: ${item.quantity} | Price: ₹${itemPrice}${itemTotal ? ` (₹${itemTotal})` : ''}`;
        }).join('\n\n');

        const isOnline = order.paymentMethod === 'Online';
        const paymentIcon = isOnline ? '💳' : '💵';
        const statusIcon = order.paymentStatus === 'Paid' ? '✅' : '⏳';

        const message = `
🛍️ *NEW ORDER RECEIVED!* 🛍️
━━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* \`${order._id}\`
📅 *Date & Time:* ${orderDate}

👤 *Customer Details:*
• *Name:* ${order.shippingDetails?.name || 'N/A'}
• *Phone:* \`${order.shippingDetails?.phone || 'N/A'}\`
• *Email:* ${order.shippingDetails?.email || 'N/A'}

📍 *Shipping Address:*
${order.shippingDetails?.address || ''}
${order.shippingDetails?.city || ''} - ${order.shippingDetails?.pincode || ''}

📦 *Ordered Items:*
${productList || 'No items listed'}

━━━━━━━━━━━━━━━━━━━━━
💰 *Total Amount:* ₹${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}
${paymentIcon} *Payment Method:* ${order.paymentMethod}
${statusIcon} *Payment Status:* ${order.paymentStatus}
${order.razorpayPaymentId ? `🔑 *Payment ID:* \`${order.razorpayPaymentId}\`\n` : ''}━━━━━━━━━━━━━━━━━━━━━
`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`✅ Telegram order notification sent successfully for Order #${order._id}`);
    } catch (error) {
        console.error('❌ Failed to send Telegram notification:', error.response ? error.response.data : error.message);
    }
}

/**
 * Send real-time Telegram notification for contact form submissions
 */
async function sendContactFormNotification(formData) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const message = `
📬 *New Contact Form Submission* 📬
━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${formData.name}
📧 *Email:* ${formData.email}
📝 *Message:*
${formData.message}
━━━━━━━━━━━━━━━━━━━━━
    `;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('✅ Contact form notification sent to Telegram.');
    } catch (error) {
        console.error('❌ Failed to send contact form Telegram notification:', error.message);
    }
}

module.exports = {
    sendTelegramNotification,
    sendContactFormNotification
};