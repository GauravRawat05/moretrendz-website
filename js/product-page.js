import { createApp } from 'vue';
import Reviews from './components/Reviews.vue';

// --- VUE APP CREATION ---
// This finds the placeholder and mounts our Vue component there.
createApp(Reviews).mount('#reviews-section-placeholder');

// --- EXISTING NON-VUE LOGIC FOR THIS PAGE ---
let currentProduct = null;

async function fetchProductDetails() {
    const container = document.getElementById('product-container');
    const loadingMessage = document.getElementById('loading-message');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = '<p class="text-center text-red-500">No product ID provided.</p>';
        return;
    }
    try {
        const response = await fetch(`https://moretrendz-backend.onrender.com/api/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        currentProduct = data.product;
        loadingMessage.style.display = 'none';
        displayProduct(data.product);
        displayRelatedProducts(data.relatedProducts);
    } catch (error) {
        console.error('Error fetching product details:', error);
        container.innerHTML = `<p class="text-center text-red-500">Error: ${error.message}. Please try again.</p>`;
    }
}

function displayProduct(product) {
    const container = document.getElementById('product-container');
    let thumbnailsHTML = '';
    product.media.forEach((item, index) => { thumbnailsHTML += `<div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMedia(${index})">${item.type === 'image' ? `<img src="${item.url}" alt="Thumbnail ${index + 1}" class="w-full h-20 object-cover rounded-md">` : `<div class="w-full h-20 bg-black flex items-center justify-center rounded-md"><i data-lucide="video" class="w-6 h-6 text-white"></i></div>`}</div>`; });
    const productHTML = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"><div class="flex flex-col-reverse md:flex-row gap-4"><div class="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden">${thumbnailsHTML}</div><div id="main-media-display" class="flex-1 aspect-w-1 aspect-h-1"></div></div><div class="flex flex-col justify-center"><h1 class="text-3xl lg:text-4xl font-bold text-gray-800">${product.name}</h1><div class="mt-4 flex items-center"><div id="product-stars-container" class="flex items-center"></div><a href="#reviews-section" id="review-count-link" class="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"></a></div><p class="text-3xl text-gray-900 mt-4">₹${product.price.toFixed(2)}</p><div class="mt-6 border-t pt-6"><div class="flex items-center space-x-4 mb-4"><label class="font-medium">Quantity:</label><div class="flex items-center border rounded-md"><button onclick="updateQuantity(-1)" class="px-3 py-1 text-lg">-</button><span id="quantity-display" class="px-4 py-1">1</span><button onclick="updateQuantity(1)" class="px-3 py-1 text-lg">+</button></div></div><button onclick="addToCart()" class="w-full bg-gray-800 text-white font-bold py-3 px-8 rounded-md hover:bg-black transition-colors mb-3">Add to Cart</button><div class="grid grid-cols-2 gap-3"><button onclick="buyNow('COD')" class="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">Buy with COD</button><button onclick="buyNow('Online')" class="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-md hover:bg-green-700 transition-colors">Prepaid (15% OFF)</button></div></div><div class="mt-8 border-t pt-6"><h2 class="text-lg font-semibold text-gray-800 mb-2">Description</h2><div class="prose-styles text-gray-600">${product.description}</div></div></div></div>`;
    container.innerHTML = productHTML;
    changeMedia(0);
    lucide.createIcons();
}

function displayRelatedProducts(products) {
    const section = document.getElementById('related-products-section');
    const grid = document.getElementById('related-products-grid');
    if (!products || products.length === 0) return;
    grid.innerHTML = '';
    products.forEach(product => { const imageUrl = (product.media && product.media.length > 0) ? product.media[0].url : 'https://placehold.co/600x750/E2E8F0/111827?text=Image'; const cardHTML = `<a href="./product.html?id=${product._id}" class="group"><div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200"><img src="${imageUrl}" alt="${product.name}" class="h-full w-full object-cover object-center group-hover:opacity-75"></div><h3 class="mt-4 text-sm text-gray-700">${product.name}</h3><p class="mt-1 text-lg font-medium text-gray-900">₹${product.price.toFixed(2)}</p></a>`; grid.innerHTML += cardHTML; });
    section.classList.remove('hidden');
}

function changeMedia(index) {
    const mainDisplay = document.getElementById('main-media-display');
    if (!currentProduct || !currentProduct.media || !currentProduct.media[index]) return;
    const mediaItem = currentProduct.media[index];
    if (mediaItem.type === 'image') { mainDisplay.innerHTML = `<img src="${mediaItem.url}" alt="${currentProduct.name}" class="w-full h-full object-cover rounded-lg shadow-md">`; } else { const videoId = mediaItem.url.split('v=')[1]?.split('&')[0] || mediaItem.url.split('/').pop(); mainDisplay.innerHTML = `<div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg shadow-md"></iframe></div>`; }
    document.querySelectorAll('.thumbnail').forEach((el, i) => { el.classList.toggle('active', i === index); });
}

function updateQuantity(change) { const quantityEl = document.getElementById('quantity-display'); let currentQuantity = parseInt(quantityEl.textContent); if (currentQuantity + change >= 1) { quantityEl.textContent = currentQuantity + change; } }

function addToCart() {
    if (!currentProduct) return;
    const quantity = parseInt(document.getElementById('quantity-display').textContent);
    let cart = JSON.parse(localStorage.getItem('moreTrendzCart')) || [];
    const existingProductIndex = cart.findIndex(item => item._id === currentProduct._id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        cart.push({ _id: currentProduct._id, name: currentProduct.name, price: currentProduct.price, imageURL: currentProduct.media[0].url, quantity: quantity });
    }
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    window.parent.postMessage({ type: 'cartUpdated', message: `${quantity} x ${currentProduct.name} added to cart!` }, '*');
}

function buyNow(method) {
    if (!currentProduct) return;
    localStorage.removeItem('moreTrendzDiscount');
    if (method === 'Online') { localStorage.setItem('moreTrendzPrepaidDiscount', 'true'); }
    const quantity = parseInt(document.getElementById('quantity-display').textContent);
    const cart = [{ _id: currentProduct._id, name: currentProduct.name, price: currentProduct.price, imageURL: currentProduct.media[0].url, quantity: quantity }];
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    window.location.href = './checkout.html';
}

// Make functions globally available so the HTML onclick attributes can find them
window.changeMedia = changeMedia;
window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.buyNow = buyNow;

// Run the main function for the page when the script loads
fetchProductDetails();