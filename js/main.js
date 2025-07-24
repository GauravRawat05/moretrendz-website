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
