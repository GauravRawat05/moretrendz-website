// File: backend/services/emailService.js

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// This is the main function that will be called to send the email
async function sendOrderConfirmationEmail(order) {
    if (!RESEND_API_KEY) {
        console.log("RESEND_API_KEY not found. Skipping email.");
        return; // Don't try to send an email if the key is missing
    }

    // --- Email Details ---
    const customerEmail = order.shippingDetails.email;
    const orderId = order._id.toString();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const totalAmount = order.totalAmount.toFixed(2);
    
    // --- Build the list of items for the email ---
    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    // --- Create the full HTML for the email ---
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #000;">Thanks for your order!</h1>
            <p>Hi ${order.shippingDetails.name},</p>
            <p>We've received your order #${orderId} and are getting it ready for you. We'll notify you when it has been shipped.</p>
            
            <h2 style="color: #000; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">Order Summary</h2>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Total</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">₹${totalAmount}</td>
                </tr>
            </table>

            <h2 style="color: #000; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">Shipping Address</h2>
            <p>
                ${order.shippingDetails.name}<br>
                ${order.shippingDetails.address}<br>
                ${order.shippingDetails.city}, ${order.shippingDetails.pincode}
            </p>
            
            <p style="margin-top: 30px;">Thanks for shopping with MoreTrendz!</p>
        </div>
    `;

    // --- Send the email using the Resend API ---
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'MoreTrendz <orders@moretrendz.online>', // IMPORTANT: This must be from your verified domain
                to: [customerEmail],
                subject: `Your MoreTrendz Order Confirmation #${orderId}`,
                html: emailHtml
            })
        });

        if (response.ok) {
            console.log(`Order confirmation email sent successfully to ${customerEmail}`);
        } else {
            const errorData = await response.json();
            console.error(`Failed to send email: ${response.status}`, errorData);
        }
    } catch (error) {
        console.error("An error occurred while sending the email:", error);
    }
}

// Make the function available to other files
module.exports = { sendOrderConfirmationEmail };
