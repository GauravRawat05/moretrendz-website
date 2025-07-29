// This file is now much simpler.
// We are only keeping the logic for the FAQ and the featured product banner.

const setupFAQ = () => {
    // This logic has been moved to main.js, so this can be removed in the future.
};

const renderFeaturedProduct = (product) => {
    if (!product || !product.media || product.media.length === 0) return;
    const heroSection = document.getElementById('hero-section');
    const heroContentContainer = document.getElementById('hero-content-container');
    const imageUrl = product.media[0].url;
    heroSection.style.backgroundImage = `url('${imageUrl}')`;
    let priceHTML = '';
    if (product.salePrice && product.salePrice < product.price) {
        priceHTML = `
            <div class="flex items-baseline justify-center md:justify-start gap-2">
                <p class="text-xl md:text-2xl text-white">₹${product.salePrice.toFixed(2)}</p>
                <p class="text-lg text-gray-300 line-through">₹${product.price.toFixed(2)}</p>
            </div>`;
    } else {
        priceHTML = `<p class="mt-4 max-w-xl mx-auto md:mx-0 text-lg md:text-xl">₹${product.price.toFixed(2)}</p>`;
    }
    heroContentContainer.innerHTML = `
        <p class="text-sm md:text-base font-semibold uppercase tracking-widest text-yellow-300">Featured Product</p>
        <h1 class="mt-4 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase">${product.name}</h1>
        <div class="mt-4">${priceHTML}</div>
        <div class="mt-8">
            <a href="./product.html?id=${product._id}" class="inline-block bg-white text-black font-bold py-3 px-10 rounded-md hover:bg-gray-200 transition-colors text-lg">Shop Now</a>
        </div>`;
};

// This function is called by main.js after the page is ready
window.initializePageScripts = async () => {
    try {
        const response = await fetch('https://moretrendz-backend.onrender.com/api/products');
        const data = await response.json();
        if (data.featuredProduct) {
            renderFeaturedProduct(data.featuredProduct);
        }
    } catch (error) {
        console.error('Failed to fetch featured product:', error);
    }
};