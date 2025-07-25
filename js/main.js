// File: js/main.js

document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch and inject HTML content
    const loadComponent = (selector, url) => {
        return fetch(url) // Return the fetch promise
            .then(response => {
                if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) element.innerHTML = data;
            })
            .catch(error => console.error(`Error loading component from ${url}:`, error));
    };

    // --- Global Header and Search Logic ---
    const setupHeader = () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const searchButton = document.getElementById('search-button');
        const searchOverlay = document.getElementById('search-overlay');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        }
        if (searchButton && searchOverlay) {
            searchButton.addEventListener('click', () => {
                searchOverlay.classList.remove('hidden');
                setTimeout(() => searchOverlay.classList.remove('opacity-0'), 10);
                searchOverlay.querySelector('input').focus();
            });
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.add('opacity-0');
                    setTimeout(() => searchOverlay.classList.add('hidden'), 300);
                }
            });
        }
    };

    // --- LOAD COMPONENTS AND THEN SETUP LOGIC ---
    // Use Promise.all to wait for ALL partials to load
    Promise.all([
        loadComponent('#header-placeholder', '/partials/header.html'),
        loadComponent('#footer-placeholder', '/partials/footer.html'),
        loadComponent('#common-elements-placeholder', '/partials/common-elements.html') // <-- ADD THIS LINE
    ]).then(() => {
        // This code runs ONLY AFTER ALL HTML is on the page
        setupHeader();

                // --- PASTE THE TOAST NOTIFICATION CODE HERE ---
        const toastElement = document.getElementById('toast-notification');
        const toastMessageElement = document.getElementById('toast-message');
        const toastIconElement = document.getElementById('toast-icon');
        let toastTimeout;

        window.showToast = (message, type = 'success') => {
            if (!toastElement || !toastMessageElement || !toastIconElement) {
                console.error('Toast elements not found!');
                return;
            }
            if (toastTimeout) clearTimeout(toastTimeout);
            toastMessageElement.textContent = message;
            if (type === 'success') {
                toastIconElement.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i>';
                toastIconElement.className = 'text-green-500';
            } else {
                toastIconElement.innerHTML = '<i data-lucide="x-circle" class="w-6 h-6"></i>';
                toastIconElement.className = 'text-red-500';
            }
            if (window.lucide) lucide.createIcons();
            toastElement.classList.remove('hidden');
            toastElement.classList.add('show', 'flex');
            toastTimeout = setTimeout(() => {
                toastElement.classList.remove('show');
                setTimeout(() => {
                    toastElement.classList.add('hidden');
                    toastElement.classList.remove('flex');
                }, 500);
            }, 4000);
        };
        // --- END OF PASTED CODE ---
        
        if (typeof updateCartIcon === 'function') {
            updateCartIcon();
        }
        
        if (typeof initializePageScripts === 'function') {
            initializePageScripts();
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
});

// Listen for messages from other pages (like the product page)
window.addEventListener('message', function(event) {
    // A basic security check, you can make this more specific if needed
    if (event.origin.includes('moretrendz.online') || event.origin.includes('localhost')) {
        if (event.data.type === 'cartUpdated') {
            // Assuming showToast is globally available from common-elements.js or main.js
            showToast(event.data.message, 'success');
            updateCartIcon(); // Also update the cart icon count
        }
    }
});