// --- Homepage Specific Logic ---
let allProducts = [];

// This function is defined in main.js now, but can be safely left here
// as it won't interfere. Or you can remove it for extra cleanup.

const setupFAQ = () => { 
    const faqQuestions = document.querySelectorAll('.faq-question'); 
    faqQuestions.forEach(question => { 
        question.addEventListener('click', () => { 
            question.classList.toggle('active'); 
        }); 
    }); 
};

const fetchProducts = async () => {
    const productGrid = document.getElementById('product-grid');
    try {
        const response = await fetch('https://moretrendz-backend.onrender.com/api/products');
        const data = await response.json();
        if (data.featuredProduct) {
            renderFeaturedProduct(data.featuredProduct);
        }
        const products = data.products;
        allProducts = products;
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No new arrivals found.</p>';
        } else {
            products.forEach(product => {
                if (!product.media || product.media.length === 0) return;
                const imageUrl = product.media[0].url;
                const productCard = `
                    <div class="group relative product-card flex flex-col">
                        <a href="./product.html?id=${product._id}" class="block">
                            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                                <img src="${imageUrl}" alt="${product.name}" class="h-full w-full object-cover object-center" loading="lazy">
                            </div>
                        </a>
                        <div class="mt-4 flex-grow">
                            <h3 class="text-sm text-gray-700"><a href="./product.html?id=${product._id}">${product.name}</a></h3>
                            <p class="mt-1 text-lg font-medium text-black">₹${product.price.toFixed(2)}</p>
                        </div>
                        <div class="mt-4 flex flex-col space-y-2">
                            <button onclick="addToCart('${product._id}')" class="w-full bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-black transition-all duration-300">Add to Cart</button>
                            <button onclick="buyNowPrepaid('${product._id}')" class="w-full bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-300">Prepaid (15% OFF)</button>
                        </div>
                    </div>`;
                productGrid.innerHTML += productCard;
            });
        }
    } catch (error) {
        console.error('Failed to fetch products:', error);
        productGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Could not load products.</p>';
    }
};

const renderFeaturedProduct = (product) => {
    if (!product.media || product.media.length === 0) return;
    const heroSection = document.getElementById('hero-section');
    const heroContentContainer = document.getElementById('hero-content-container');
    const imageUrl = product.media[0].url;
    heroSection.style.backgroundImage = `url('${imageUrl}')`;
    heroContentContainer.innerHTML = `
        <p class="text-sm md:text-base font-semibold uppercase tracking-widest text-yellow-300">Featured Product</p>
        <h1 class="mt-4 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase">${product.name}</h1>
        <p class="mt-4 max-w-xl mx-auto md:mx-0 text-lg md:text-xl">₹${product.price.toFixed(2)}</p>
        <div class="mt-8">
            <a href="./product.html?id=${product._id}" class="inline-block bg-white text-black font-bold py-3 px-10 rounded-md hover:bg-gray-200 transition-colors text-lg">Shop Now</a>
        </div>`;
};

const saveCart = (cart) => {
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    if (window.updateCartIcon) {
        window.updateCartIcon();
    }
};

window.addToCart = (productId) => {
    const productToAdd = allProducts.find(p => p._id === productId);
    if (!productToAdd) return;
    
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
          content_name: productToAdd.name,
          content_ids: [productToAdd._id],
          content_type: 'product',
          value: productToAdd.price,
          currency: 'INR'
      });
    }

    let cart = window.getCart();
    const existingProductIndex = cart.findIndex(item => item._id === productId);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        const cartItem = {
            _id: productToAdd._id,
            name: productToAdd.name,
            price: productToAdd.price,
            imageURL: productToAdd.media[0].url,
            quantity: 1
        };
        cart.push(cartItem);
    }
    saveCart(cart);
    
    if (window.showToast) {
        window.showToast(`${productToAdd.name} has been added to your cart!`);
    }
};

window.buyNowPrepaid = (productId) => {
    localStorage.removeItem('moreTrendzDiscount');
    const productToAdd = allProducts.find(p => p._id === productId);
    if (!productToAdd) return;
    let cart = [];
    const cartItem = {
        _id: productToAdd._id,
        name: productToAdd.name,
        price: productToAdd.price,
        imageURL: productToAdd.media[0].url,
        quantity: 1
    };
    cart.push(cartItem);
    localStorage.setItem('moreTrendzPrepaidDiscount', 'true');
    saveCart(cart);
    window.location.href = './checkout.html';
};

// This function is called by main.js after the page is ready
window.initializePageScripts = () => {
    fetchProducts();
    setupFAQ();
};