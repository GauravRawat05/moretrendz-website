<template>
  <section class="py-16 sm:py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center tracking-tight text-black mb-12">New Arrivals</h2>
      
      <div v-if="isLoading" class="mt-12 text-center text-gray-500">Loading products...</div>
      <div v-else-if="error" class="mt-12 text-center text-red-500">{{ error }}</div>
      
      <div v-else-if="products.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
        <div v-for="(product, index) in products" :key="product._id" 
             class="group relative product-card flex flex-col animate-fade-in-up"
             :style="{ animationDelay: `${index * 100}ms` }">
          <a :href="`./product.html?id=${product._id}`" class="block">
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <img :src="product.media[0].url" :alt="product.name" class="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500" loading="lazy">
              <div v-if="product.salePrice && product.salePrice < product.price" class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                {{ calculateDiscountPercentage(product.price, product.salePrice) }}% OFF
              </div>
            </div>
          </a>
          <div class="mt-4 flex-grow">
            <h3 class="text-base font-semibold text-gray-900 group-hover:text-black transition-colors"><a :href="`./product.html?id=${product._id}`">{{ product.name }}</a></h3>
            <div v-if="product.salePrice && product.salePrice < product.price" class="mt-1 flex items-center gap-2">
            <span class="text-lg font-bold text-black">₹{{ product.salePrice.toFixed(2) }}</span>
            <span class="text-sm text-gray-500 line-through">₹{{ product.price.toFixed(2) }}</span> </div>
            <p v-else class="mt-1 text-lg font-bold text-black">₹{{ product.price.toFixed(2) }}</p>
          </div>
          <!-- Desktop Buttons (Hover Only) -->
          <div class="mt-4 hidden md:flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button @click="addToCart(product)" class="w-full bg-black text-white text-sm font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition-colors shadow-md">Add to Cart</button>
            <button @click="buyNowPrepaid(product)" class="w-full bg-green-600 text-white text-sm font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors shadow-md">Prepaid (15% OFF)</button>
          </div>
          <!-- Mobile Buttons (Always Visible) -->
          <div class="mt-4 flex flex-col space-y-2 md:hidden">
             <button @click="addToCart(product)" class="w-full bg-black text-white text-sm font-bold py-3 px-4 rounded-md">Add to Cart</button>
          </div>
        </div>
      </div>
      
      <div v-else class="mt-12 text-center text-gray-500">No new arrivals found.</div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const isLoading = ref(true);
const error = ref(null);

const calculateDiscountPercentage = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount);
};

// Fetch products when the component is first created
onMounted(async () => {
  try {
    const response = await fetch('https://moretrendz-backend.onrender.com/api/products');
    const data = await response.json();
    products.value = data.products || [];
  } catch (err) {
    error.value = 'Could not load products.';
    console.error('Failed to fetch products:', err);
  } finally {
    isLoading.value = false;
  }
});

// --- Cart Logic (moved from home.js) ---
const getCart = () => JSON.parse(localStorage.getItem('moreTrendzCart')) || [];

const saveCart = (cart) => {
    localStorage.setItem('moreTrendzCart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
};

const addToCart = (productToAdd) => {
    if (!productToAdd) return;

    const priceToAdd = productToAdd.salePrice && productToAdd.salePrice < productToAdd.price 
        ? productToAdd.salePrice 
        : productToAdd.price;
    
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
          content_name: productToAdd.name,
          content_ids: [productToAdd._id],
          content_type: 'product',
          value: priceToAdd,
          currency: 'INR'
      });
    }

    let cart = getCart();
    const existingProductIndex = cart.findIndex(item => item._id === productToAdd._id);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({
            _id: productToAdd._id,
            name: productToAdd.name,
            price: priceToAdd,
            imageURL: productToAdd.media[0].url,
            quantity: 1
        });
    }
    saveCart(cart);
    
    if (window.showToast) {
        window.showToast(`1 x ${productToAdd.name} added to cart!`, 'success');
    }
};

const buyNowPrepaid = (productToAdd) => {
    localStorage.removeItem('moreTrendzDiscount');
    if (!productToAdd) return;
    const cart = [{
        _id: productToAdd._id,
        name: productToAdd.name,
        price: productToAdd.price,
        imageURL: productToAdd.media[0].url,
        quantity: 1
    }];
    localStorage.setItem('moreTrendzPrepaidDiscount', 'true');
    saveCart(cart);
    window.location.href = './checkout.html';
};
</script>