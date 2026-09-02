// This file is now much simpler.
// We are only keeping the logic for the FAQ and the featured product banner.

const renderFeaturedProduct = (product) => {
    if (!product || !product.media || product.media.length === 0) return;

    // Background Image logic removed to keep the static hero image

    // Update Content
    const heroContentContainer = document.getElementById('hero-content-container');
    if (heroContentContainer) {
        let priceHTML = '';
        if (product.salePrice && product.salePrice < product.price) {
            priceHTML = `
                <div class="flex items-baseline justify-center gap-3 mt-4 animate-fade-in-up delay-200">
                    <p class="text-3xl md:text-4xl font-bold text-white">₹${product.salePrice.toFixed(2)}</p>
                    <p class="text-xl text-gray-300 line-through">₹${product.price.toFixed(2)}</p>
                </div>`;
        } else {
            priceHTML = `<p class="mt-4 text-2xl md:text-3xl font-bold text-white animate-fade-in-up delay-200">₹${product.price.toFixed(2)}</p>`;
        }

        heroContentContainer.innerHTML = `
            <span class="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-semibold tracking-wider mb-6 animate-fade-in-up">FEATURED DROP</span>
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-tight uppercase animate-fade-in-up delay-100">${product.name}</h1>
            ${priceHTML}
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in-up delay-300">
                <a href="./product.html?id=${product._id}" class="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg">
                    Shop Now
                </a>
            </div>`;
    }
};

// This function is called by main.js after the page is ready
window.initializePageScripts = async () => {
    try {
        const apiBase = window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : 'https://mt-backend-bvzf.onrender.com/api');
        const response = await fetch(`${apiBase}/products`);
        const data = await response.json();
        if (data.featuredProduct) {
            renderFeaturedProduct(data.featuredProduct);
        }
    } catch (error) {
        console.error('Failed to fetch featured product:', error);
    }
};