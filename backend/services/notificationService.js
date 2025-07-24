// File: backend/services/notificationService.js (Updated for Google Sheets)

const axios = require('axios');
const { google } = require('googleapis');
const { auth } = require('google-auth-library');

// --- Telegram Notification Logic (Unchanged) ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramNotification(order) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram credentials not set, skipping notification.');
        return;
    }
    // ... (The rest of the Telegram function is exactly the same as before)
    const productList = order.orderItems.map(item => `- ${item.name} (Qty: ${item.quantity})`).join('\n');
    const message = `
🚨 *New Order Received!* 🚨

*Order ID:* \`${order._id}\`
*Customer Name:* ${order.shippingDetails.name}
*Phone:* \`${order.shippingDetails.phone}\`
*Address:* ${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.pincode}

*Products:*
${productList}

*Total Amount:* ₹${order.totalAmount.toFixed(2)}
*Payment Method:* ${order.paymentMethod}
*Payment Status:* ${order.paymentStatus}
    `;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' });
        console.log('Telegram notification sent successfully.');
    } catch (error) {
        console.error('Failed to send Telegram notification:', error.response ? error.response.data : error.message);
    }
}


// --- NEW: Google Sheets Logging Logic ---
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

async function logOrderToGoogleSheet(order) {
    if (!process.env.GOOGLE_CREDENTIALS_JSON || !GOOGLE_SHEET_ID) {
        console.log('Google Sheets credentials not set, skipping logging.');
        return;
    }

    try {
        // Authenticate with Google
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        const client = auth.fromJSON(credentials);
        client.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
        const sheets = google.sheets({ version: 'v4', auth: client });

        // Format data for the sheet
        const rows = order.orderItems.map(item => [
            order._id.toString(),
            new Date(order.createdAt).toLocaleString('en-IN'),
            order.shippingDetails.name,
            order.shippingDetails.phone,
            order.shippingDetails.email,
            order.shippingDetails.address,
            order.shippingDetails.city,
            order.shippingDetails.pincode,
            item.name,
            item.quantity,
            item.price.toFixed(2),
            order.totalAmount.toFixed(2),
            order.paymentMethod,
            order.paymentStatus
        ]);

        // Append the rows to the sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:A', // Appends to the first empty row in the sheet
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rows,
            },
        });
        console.log(`Order ${order._id} logged to Google Sheet.`);

    } catch (error) {
        console.error('❌ Error logging order to Google Sheet:', error);
    }
}

module.exports = {
    sendTelegramNotification,
    logOrderToGoogleSheet // <-- UPDATED EXPORT
};