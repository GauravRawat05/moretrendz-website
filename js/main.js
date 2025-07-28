// File: js/main.js

document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch and inject HTML content
    const loadComponent = (selector, url) => {
        return fetch(url)
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

    // Global Header and Search Logic
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


    // Use Promise.all to wait for ALL partials to load
    Promise.all([
        loadComponent('#header-placeholder', '/partials/header.html'),
        loadComponent('#footer-placeholder', '/partials/footer.html'),
        loadComponent('#common-elements-placeholder', '/partials/common-elements.html')
    ]).then(() => {
        // This code runs ONLY AFTER ALL HTML partials are on the page
                const setupFAQ = () => { 
            const faqQuestions = document.querySelectorAll('.faq-question'); 
            faqQuestions.forEach(question => { 
                question.addEventListener('click', () => { 
                    question.classList.toggle('active'); 
                }); 
            }); 
        };
        // 1. Setup header event listeners
        setupHeader();
        setupFAQ();

        // --- NEW MODAL LOGIC ---
        const modalBackdrop = document.getElementById('generic-modal-backdrop');
        const modalContent = document.getElementById('generic-modal-content');
        const modalTitle = document.getElementById('generic-modal-title');
        const modalMessage = document.getElementById('generic-modal-message');

        window.showModal = (title, message) => {
            if (!modalBackdrop) return;
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalBackdrop.classList.remove('hidden');
            setTimeout(() => {
                modalBackdrop.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95');
            }, 10);
        };

        window.closeModal = () => {
            if (!modalBackdrop) return;
            modalBackdrop.classList.add('opacity-0');
            modalContent.classList.add('scale-95');
            setTimeout(() => modalBackdrop.classList.add('hidden'), 300);
        };
        // --- END OF NEW MODAL LOGIC ---

        // 2. Define global helper functions
        window.getCart = () => JSON.parse(localStorage.getItem('moreTrendzCart')) || [];

        window.updateCartIcon = () => {
            const cart = window.getCart();
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCountElement.textContent = totalItems;
            }
        };

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

        // 3. Setup the message listener (MOVED HERE)
        window.addEventListener('message', function (event) {
            // A basic security check
            if (event.origin.includes('moretrendz.online') || event.origin.includes('localhost') || event.origin.includes('127.0.0.1')) {
                if (event.data.type === 'cartUpdated') {
                    window.showToast(event.data.message, 'success');
                    window.showModal('Added to Cart!', event.data.message);
                    window.updateCartIcon(); // Update the cart icon count
                }
            }
        });

        // 4. Run initial setup scripts
        window.updateCartIcon(); // Update cart on initial load

        if (typeof initializePageScripts === 'function') {
            initializePageScripts();
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
});