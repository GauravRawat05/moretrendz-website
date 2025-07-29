<template>
  <header class="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-lg shadow-sm">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <a href="./index.html" class="text-2xl font-bold tracking-wider text-black">MORETRENDZ</a>
        <nav class="hidden md:flex md:items-center md:space-x-10">
          <a href="./index.html" class="text-sm font-medium text-gray-700 hover:text-black">HOME</a>
          <a href="#" class="text-sm font-medium text-gray-700 hover:text-black">CATALOG</a>
          <a href="./contact.html" class="text-sm font-medium text-gray-700 hover:text-black">CONTACT</a>
        </nav>
        <div class="flex items-center space-x-2 sm:space-x-4">
          <button @click="isSearchOpen = true" class="p-2 rounded-md text-gray-700 hover:text-black" aria-label="Open search bar">
            <i data-lucide="search" class="w-6 h-6" aria-hidden="true"></i>
          </button>
          <a href="./cart.html" class="relative group p-2" aria-label="View Shopping Cart">
            <i data-lucide="shopping-cart" class="w-6 h-6 text-gray-700 group-hover:text-black" aria-hidden="true"></i>
            <span class="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">{{ cartItemCount }}</span>
          </a>
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 rounded-md text-gray-700 hover:text-black" aria-label="Open main menu">
            <i data-lucide="menu" class="w-6 h-6" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-if="isMobileMenuOpen" class="md:hidden border-t">
      </div>
    <div v-if="isSearchOpen" @click.self="isSearchOpen = false" class="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-start justify-center pt-20">
      </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- State for the component ---
const cartItemCount = ref(0);
const isMobileMenuOpen = ref(false);
const isSearchOpen = ref(false); // Note: Search logic is simplified here

const updateCartIcon = () => {
    const cart = JSON.parse(localStorage.getItem('moreTrendzCart')) || [];
    cartItemCount.value = cart.reduce((sum, item) => sum + item.quantity, 0);
};

// --- Lifecycle Hook ---
onMounted(() => {
  // Update the cart count when the component first loads
  updateCartIcon();

  // Listen for a custom 'cart-updated' event from anywhere in the application
  window.addEventListener('cart-updated', () => {
    updateCartIcon();
  });

  // Re-initialize lucide icons if they are used in the template
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>