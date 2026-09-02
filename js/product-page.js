import { createApp } from 'vue';
import Reviews from './components/Reviews.vue';

// --- VUE APP CREATION ---
// This finds the placeholder and mounts our Vue component there.
createApp(Reviews).mount('#reviews-section-placeholder');

// --- EXISTING NON-VUE LOGIC FOR THIS PAGE ---
let currentProduct = null;
let relatedProductsList = [];

const calculateDiscountPercentage = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount);
};

async function fetchProductDetails() {
    const container = document.getElementById('product-container');
    const skeleton = document.getElementById('product-skeleton-loader');
    const loadingMessage = document.getElementById('loading-message');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        if(skeleton) skeleton.style.display = 'none';
        container.innerHTML = '<p class="text-center text-red-500">No product ID provided.</p>';
        return;
    }
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (!productId) { 
            throw new Error('No product ID provided.');
        }

        const apiBase = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : 'https://mt-backend-bvzf.onrender.com/api');
        const response = await fetch(`${apiBase}/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        if (!data.product) throw new Error('Product data not found in API response.');
        currentProduct = data.product;
        loadingMessage.style.display = 'none';
        displayProduct(data.product);
        displayRelatedProducts(data.relatedProducts);

        if(skeleton) skeleton.style.display = 'none';
        container.classList.remove('opacity-0');
    } catch (error) {
        console.error('Error fetching product details:', error);
        if(skeleton) skeleton.style.display = 'none';
        container.innerHTML = `<p class="text-center text-red-500">Error: ${error.message}. Please try again.</p>`;
        container.classList.remove('opacity-0');
    }
}

function displayProduct(product) {
    const container = document.getElementById('product-container');
    let thumbnailsHTML = '';
    product.media.forEach((item, index) => {
        thumbnailsHTML += `<div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMedia(${index})">${item.type === 'image' ? `<img src="${item.url}" alt="Thumbnail ${index + 1}" class="w-full h-20 object-cover rounded-md">` : `<div class="w-full h-20 bg-black flex items-center justify-center rounded-md"><i data-lucide="video" class="w-6 h-6 text-white"></i></div>`}</div>`;
    });
    let priceHTML = '';
    if (product.salePrice && product.salePrice < product.price) {
        priceHTML = `
            <div class="flex items-baseline gap-2">
                <p class="text-3xl text-red-600 font-bold">₹${product.salePrice.toFixed(2)}</p>
                <p class="text-xl text-gray-500 line-through">₹${product.price.toFixed(2)}</p>
            </div>`;
    } else {
        priceHTML = `<p class="text-3xl text-gray-900">₹${product.price.toFixed(2)}</p>`;
    }

    let saleTagHTML = '';
    if (product.salePrice) {
        saleTagHTML = `
            <div class="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md z-10">
                ${calculateDiscountPercentage(product.price, product.salePrice)}% OFF
            </div>`;
    }
    // --- END OF NEW HTML ---

    const productHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
        <div class="flex flex-col-reverse md:flex-row gap-4">
          <div class="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden">${thumbnailsHTML}</div>
          <div id="main-media-display" class="flex-1 aspect-w-1 aspect-h-1"></div>
        </div>
        <div class="flex flex-col justify-center">
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-800">${product.name}</h1>
          <div class="mt-4 flex items-center">
            <div id="product-stars-container" class="flex items-center"></div>
            <a href="#reviews-section" id="review-count-link" class="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"></a>
          </div>
          <div class="mt-4">${priceHTML}</div>
          <div class="mt-6 border-t pt-6">
            <div class="flex items-center space-x-4 mb-4">
              <label class="font-medium">Quantity:</label>
              <div class="flex items-center border rounded-md">
                <button onclick="updateQuantity(-1)" class="px-3 py-1 text-lg">-</button>
                <span id="quantity-display" class="px-4 py-1">1</span>
                <button onclick="updateQuantity(1)" class="px-3 py-1 text-lg">+</button>
              </div>
            </div>
            <button onclick="addToCart()" class="w-full bg-gray-800 text-white font-bold py-3 px-8 rounded-md hover:bg-black transition-colors mb-3">Add to Cart</button>
            <div class="grid grid-cols-2 gap-3">
                <button onclick="buyNow('COD')" class="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">Buy with COD</button>
                <button onclick="buyNow('Online')" class="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-md hover:bg-green-700 transition-colors">Prepaid (15% OFF)</button>
            </div>
          </div>
          <div class="mt-8 border-t pt-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <div class="prose-styles text-gray-600">${product.description}</div>
          </div>
        </div>
      </div>`;
    container.innerHTML = productHTML;
    changeMedia(0);
    lucide.createIcons();
}

function displayRelatedProducts(products) {
    const section = document.getElementById('related-products-section');
    const grid = document.getElementById('related-products-grid');
    if (!products || products.length === 0) return;
    relatedProductsList = products; // Store products for the buttons to use
    grid.innerHTML = '';
    products.forEach(product => {
        const imageUrl = (product.media && product.media.length > 0) ? product.media[0].url : 'https://placehold.co/600x750/E2E8F0/111827?text=Image';
        // --- NEW: Price and Sale Tag HTML Logic ---
        let saleTagHTML = '';
        if (product.salePrice && product.salePrice < product.price) {
            saleTagHTML = `<div class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">${calculateDiscountPercentage(product.price, product.salePrice)}% OFF</div>`;
        }
        let priceHTML = '';
        if (product.salePrice && product.salePrice < product.price) {
            priceHTML = `<div class="mt-1"><span class="text-lg font-medium text-black">₹${product.salePrice.toFixed(2)}</span><span class="ml-2 text-sm text-gray-500 line-through">₹${product.price.toFixed(2)}</span></div>`;
        } else {
            priceHTML = `<p class="mt-1 text-lg font-medium text-black">₹${product.price.toFixed(2)}</p>`;
        }
        // --- NEW: Full Card HTML with Buttons ---
        const cardHTML = `
            <div class="group relative product-card flex flex-col">
                <a href="./product.html?id=${product._id}" class="block">
                    <div class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                        <img src="${imageUrl}" alt="${product.name}" class="h-full w-full object-cover object-center" loading="lazy">
                        ${saleTagHTML}
                    </div>
                </a>
                <div class="mt-4 flex-grow">
                    <h3 class="text-sm text-gray-700"><a href="./product.html?id=${product._id}">${product.name}</a></h3>
                    ${priceHTML}
                </div>
                <div class="mt-4 flex flex-col space-y-2">
                    <button onclick="addToCartFromRelated('${product._id}')" class="w-full bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-black transition-all duration-300">Add to Cart</button>
                    <button onclick="buyNowPrepaidFromRelated('${product._id}')" class="w-full bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-300">Prepaid (15% OFF)</button>
                </div>
            </div>`;
        grid.innerHTML += cardHTML;
    });
    section.classList.remove('hidden');
}

function addToCartFromRelated(productId) {
    const productToAdd = relatedProductsList.find(p => p._id === productId);
    if (!productToAdd) return;
    const priceToAdd = productToAdd.salePrice && productToAdd.salePrice < productToAdd.price 
        ? productToAdd.salePrice 
        : productToAdd.price;

    let cart = window.getCart ? window.getCart() : [];
    const existingProductIndex = cart.findIndex(item => item._id === productToAdd._id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ _id: productToAdd._id, name: productToAdd.name, price: priceToAdd, imageURL: productToAdd.media[0].url, quantity: 1 });
    }
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    
    if (window.showToast) {
        window.showToast(`1 x ${productToAdd.name} added to cart!`, 'success');
    }
    
    window.dispatchEvent(new CustomEvent('cart-updated'));
}

function buyNowPrepaidFromRelated(productId) {
    const productToAdd = relatedProductsList.find(p => p._id === productId);
    if (!productToAdd) return;
    
    localStorage.removeItem('moreTrendzDiscount');
    const cart = [{ _id: productToAdd._id, name: productToAdd.name, price: productToAdd.price, imageURL: productToAdd.media[0].url, quantity: 1 }];
    localStorage.setItem('moreTrendzPrepaidDiscount', 'true');
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    window.location.href = './checkout.html';
}

function changeMedia(index) {
    const mainDisplay = document.getElementById('main-media-display');
    if (!currentProduct || !currentProduct.media || !currentProduct.media[index]) return;
    const mediaItem = currentProduct.media[index];
    if (mediaItem.type === 'image') { mainDisplay.innerHTML = `<img src="${mediaItem.url}" alt="${currentProduct.name}" class="w-full h-full object-contain rounded-lg shadow-md">`; } else { const videoId = mediaItem.url.split('v=')[1]?.split('&')[0] || mediaItem.url.split('/').pop(); mainDisplay.innerHTML = `<div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-lg shadow-md"></iframe></div>`; }
    document.querySelectorAll('.thumbnail').forEach((el, i) => { el.classList.toggle('active', i === index); });
}

function updateQuantity(change) { const quantityEl = document.getElementById('quantity-display'); let currentQuantity = parseInt(quantityEl.textContent); if (currentQuantity + change >= 1) { quantityEl.textContent = currentQuantity + change; } }

function addToCart() {
    if (!currentProduct) return;
    const quantity = parseInt(document.getElementById('quantity-display').textContent);
    const priceToAdd = currentProduct.salePrice &&      currentProduct.salePrice < currentProduct.price 
        ? currentProduct.salePrice 
        : currentProduct.price;

    let cart = JSON.parse(localStorage.getItem('moreTrendzCart')) || [];
    const existingProductIndex = cart.findIndex(item => item._id === currentProduct._id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += quantity;
    } else {
        cart.push({ _id: currentProduct._id, name: currentProduct.name, price: priceToAdd, imageURL: currentProduct.media[0].url, quantity: quantity });
    }
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    if (window.showToast) {
        window.showToast(`${quantity} x ${currentProduct.name} added to cart!`, 'success');
    }
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
window.addToCartFromRelated = addToCartFromRelated;
window.buyNowPrepaidFromRelated = buyNowPrepaidFromRelated;

// Run the main function for the page when the script loads
fetchProductDetails();