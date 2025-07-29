import { createApp } from 'vue'; // <-- NEW: Import createApp from Vue
import Header from './components/Header.vue'; // <-- NEW: Import your Header component

document.addEventListener("DOMContentLoaded", function () {
    // --- CREATE AND MOUNT THE VUE HEADER ---
    createApp(Header).mount('#header-placeholder');

    const loadComponent = (selector, url) => { /* ... (this function is unchanged) ... */ };

    Promise.all([
        // REMOVED: loadComponent for header, Vue is handling it now
        loadComponent('#footer-placeholder', '/partials/footer.html'),
        loadComponent('#common-elements-placeholder', '/partials/common-elements.html'),
        loadComponent('#faq-placeholder', '/partials/faq.html')
    ]).then(() => {
        // REMOVED: setupHeader(), it's now inside Header.vue
        // REMOVED: getCart() and updateCartIcon(), they are now inside Header.vue

        const setupFAQ = () => { /* ... (this function is unchanged) ... */ };
        setupFAQ();

        // Modal and Toast logic remains
        const modalBackdrop = document.getElementById('generic-modal-backdrop');
        // ... (rest of the modal/toast logic is unchanged) ...
        window.showModal = (title, message) => { /* ... */ };
        window.closeModal = () => { /* ... */ };
        window.showToast = (message, type = 'success') => { /* ... */ };

        // The message listener for pop-ups
        window.addEventListener('message', function (event) { /* ... (this is unchanged) ... */ });

        if (typeof initializePageScripts === 'function') {
            initializePageScripts();
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
});