<template>
  <section class="py-16 sm:py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center tracking-tight text-black">New Arrivals</h2>
      
      <div v-if="isLoading" class="mt-12 text-center text-gray-500">Loading products...</div>
      <div v-else-if="error" class="mt-12 text-center text-red-500">{{ error }}</div>
      
      <div v-else-if="products.length > 0" class="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
        <div v-for="product in products" :key="product._id" class="group relative product-card flex flex-col">
          <a :href="`./product.html?id=${product._id}`" class="block">
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
              <img :src="product.media[0].url" :alt="product.name" class="h-full w-full object-cover object-center" loading="lazy">
              <div v-if="product.salePrice" class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {{ calculateDiscountPercentage(product.price, product.salePrice) }}% OFF
              </div>
            </div>
          </a>
          <div class="mt-4 flex-grow">
            <h3 class="text-sm text-gray-700"><a :href="`./product.html?id=${product._id}`">{{ product.name }}</a></h3>
            <div v-if="product.salePrice" class="mt-1">
            <span class="text-lg font-medium text-black">₹{{ product.salePrice.toFixed(2) }}</span>
            <span class="ml-2 text-sm text-gray-500 line-through">₹{{ product.price.toFixed(2) }}</span></div>
            <p class="mt-1 text-lg font-medium text-black">₹{{ product.price.toFixed(2) }}</p>
          </div>
          <div class="mt-4 flex flex-col space-y-2">
            <button @click="addToCart(product)" class="w-full bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-black transition-all duration-300">Add to Cart</button>
            <button @click="buyNowPrepaid(product)" class="w-full bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-300">Prepaid (15% OFF)</button>
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
    
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
          content_name: productToAdd.name,
          content_ids: [productToAdd._id],
          content_type: 'product',
          value: productToAdd.price,
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
            price: productToAdd.price,
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