// vite.config.js
const { resolve } = require('path');
const { defineConfig } = require('vite');
const htmlInject = require('vite-plugin-html-inject');

module.exports = defineConfig({
  plugins: [
    htmlInject(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // This is the new section that tells Vite about all your pages
        main: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'cart.html'),
        product: resolve(__dirname, 'product.html'),
        contact: resolve(__dirname, 'contact.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        orderConfirmation: resolve(__dirname, 'order-confirmation.html'),
        searchResults: resolve(__dirname, 'search-results.html'),
        privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
        refundPolicy: resolve(__dirname, 'refund-policy.html'),
        shippingPolicy: resolve(__dirname, 'shipping-policy.html'),
        termsAndConditions: resolve(__dirname, 'terms-and-conditions.html'),
        adminLogin: resolve(__dirname, 'admin_login.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
      },
    },
  },
});