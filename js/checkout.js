
// --- Existing Page Logic ---
const checkoutForm = document.getElementById('checkout-form');
const discountInput = document.getElementById('discount-code-input');
const applyDiscountBtn = document.getElementById('apply-discount-btn');
const discountMessage = document.getElementById('discount-message');

document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    checkPrepaidDiscount();
    lucide.createIcons();
});

function getCart() { return JSON.parse(localStorage.getItem('moreTrendzCart')) || []; }

function displayOrderSummary() {
    const cart = getCart();
    const summaryList = document.getElementById('order-summary-list');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const discountDisplay = document.getElementById('discount-display');
    const discountAmountEl = document.getElementById('summary-discount');

    summaryList.innerHTML = '';
    let subtotal = 0;
    if (cart.length === 0) {
        summaryList.innerHTML = '<p>Your cart is empty.</p>';
        if (checkoutForm) checkoutForm.querySelector('button[type="submit"]').disabled = true;
        return;
    }
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const itemHTML = `<div class="flex justify-between items-center"><div class="flex items-center"><div class="relative"><img src="${item.imageURL}" alt="${item.name}" class="h-16 w-16 object-cover rounded-md mr-4"><span class="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${item.quantity}</span></div><div><h3 class="font-semibold">${item.name}</h3></div></div><p class="font-semibold">₹${itemTotal.toFixed(2)}</p></div>`;
        summaryList.innerHTML += itemHTML;
    });

    const appliedDiscount = JSON.parse(localStorage.getItem('moreTrendzDiscount')) || { percentage: 0 };
    const discountAmount = (subtotal * appliedDiscount.percentage) / 100;
    const total = subtotal - discountAmount;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (discountAmount > 0) {
        discountAmountEl.textContent = `-₹${discountAmount.toFixed(2)}`;
        discountDisplay.classList.remove('hidden');
    } else {
        discountDisplay.classList.add('hidden');
    }
    totalEl.textContent = `₹${total.toFixed(2)}`;
}

async function checkPrepaidDiscount() {
    if (localStorage.getItem('moreTrendzPrepaidDiscount') === 'true') {
        localStorage.setItem('moreTrendzDiscount', JSON.stringify({ code: 'PREPAID15', percentage: 15 }));
        localStorage.removeItem('moreTrendzPrepaidDiscount');
        discountMessage.textContent = '15% prepaid discount applied!';
        discountMessage.classList.add('text-green-600');
        document.getElementById('payment-online').checked = true;
        displayOrderSummary();
    }
}

if (applyDiscountBtn) {
    applyDiscountBtn.addEventListener('click', async () => {
        const code = discountInput.value.trim();
        if (!code) return;

        try {
            const response = await fetch('https://moretrendz-backend.onrender.com/api/discounts/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const result = await response.json();
            if (result.isValid) {
                localStorage.setItem('moreTrendzDiscount', JSON.stringify({ code: code.toUpperCase(), percentage: result.discountPercentage }));
                discountMessage.textContent = `Success! ${result.discountPercentage}% discount applied.`;
                discountMessage.classList.remove('text-red-600');
                discountMessage.classList.add('text-green-600');
            } else {
                localStorage.removeItem('moreTrendzDiscount');
                discountMessage.textContent = result.message || 'Invalid code.';
                discountMessage.classList.remove('text-green-600');
                discountMessage.classList.add('text-red-600');
            }
            displayOrderSummary();
        } catch (error) {
            console.error('Error validating discount:', error);
            discountMessage.textContent = 'Could not validate code.';
            discountMessage.classList.add('text-red-600');
        }
    });
}

// --- NEW REDIRECT MODAL FUNCTION ---
function showRedirectModal(orderId) {
    const modalMessage = document.getElementById('generic-modal-message');
    let countdown = 5;

    // Show the modal with the initial message
    if (window.showModal) {
        window.showModal('Order Placed Successfully!', `Redirecting in ${countdown} seconds...`);
    } else {
        console.warn('showModal function not found');
    }

    const interval = setInterval(() => {
        countdown--;
        if (modalMessage) modalMessage.textContent = `Redirecting in ${countdown} seconds...`;
        if (countdown <= 0) {
            clearInterval(interval);
            window.location.href = `./order-confirmation.html?status=success&orderId=${orderId}`;
        }
    }, 1000);
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        // This is a helper function to avoid repeating the pixel code
        const trackPurchase = (order) => {
            const contentIds = order.orderItems.map(item => item._id);
            const productNames = order.orderItems.map(item => item.name).join(', '); // Creates a string of product names

            if (typeof fbq === 'function') {
                fbq('track', 'Purchase', {
                    value: order.totalAmount,
                    currency: 'INR',
                    content_ids: contentIds,
                    content_name: productNames,
                    content_type: 'product'
                });
            }
        };
        const cart = getCart();
        if (cart.length === 0) {
            // --- UPDATED: Replaced alert with showToast ---
            if (typeof showToast === 'function') {
                showToast("Your cart is empty!", 'error');
            } else {
                alert("Your cart is empty!");
            }
            return;
        }

        const formData = new FormData(checkoutForm);
        const shippingDetails = Object.fromEntries(formData.entries());
        const paymentMethod = shippingDetails.paymentMethod;

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const appliedDiscount = JSON.parse(localStorage.getItem('moreTrendzDiscount')) || { percentage: 0 };
        const discountAmount = (subtotal * appliedDiscount.percentage) / 100;
        const totalAmount = subtotal - discountAmount;

        const orderPayload = { shippingDetails, orderItems: cart, totalAmount, paymentMethod };

        try {
            const orderResponse = await fetch('https://moretrendz-backend.onrender.com/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(orderData.message || 'Failed to create order');

            localStorage.removeItem('moreTrendzCart');
            localStorage.removeItem('moreTrendzDiscount');

            if (paymentMethod === 'COD') {
                // --- ⬇️ ADD THIS PIXEL CODE for COD ⬇️ ---
                trackPurchase(orderData.dbOrder);
                // --- ⬆️ END OF PIXEL CODE ⬆️ ---
                showRedirectModal(orderData.dbOrder._id);
            } else if (paymentMethod === 'Online') {
                const { dbOrder, razorpayOrder } = orderData;
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY, // Using environment variable
                    amount: razorpayOrder.amount,
                    currency: "INR",
                    name: "MoreTrendz",
                    description: `Order #${dbOrder._id}`,
                    image: "https://placehold.co/100x100/000000/FFFFFF?text=MT",
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        const verificationData = { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, dbOrderId: dbOrder._id };
                        const verificationResponse = await fetch('https://moretrendz-backend.onrender.com/api/orders/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(verificationData) });
                        if (verificationResponse.ok) {
                            // --- ⬇️ ADD THIS PIXEL CODE for Online ⬇️ ---
                            trackPurchase(dbOrder);
                            // --- ⬆️ END OF PIXEL CODE ⬆️ ---
                            showRedirectModal(orderData.dbOrder._id);
                        } else {
                            window.location.href = `./order-confirmation.html?status=failed&orderId=${dbOrder._id}`;
                        }
                    },
                    prefill: { name: shippingDetails.name, email: shippingDetails.email, contact: shippingDetails.phone },
                    theme: { color: "#000000" }
                };
                const rzp1 = new Razorpay(options);
                rzp1.open();
            }
        } catch (error) {
            console.error('Error placing order:', error);
            window.location.href = `./order-confirmation.html?status=failed`;
        }
    });
}
