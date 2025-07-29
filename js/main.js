import { createApp } from 'vue'; // <-- NEW: Import createApp from Vue
import Header from './components/Header.vue'; // <-- NEW: Import your Header component

window.getCart = () => JSON.parse(localStorage.getItem('moreTrendzCart')) || [];

document.addEventListener("DOMContentLoaded", function () {
    // --- CREATE AND MOUNT THE VUE HEADER ---
    createApp(Header).mount('#header-placeholder');

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

    Promise.all([
        // REMOVED: loadComponent for header, Vue is handling it now
        loadComponent('#footer-placeholder', '/partials/footer.html'),
        loadComponent('#common-elements-placeholder', '/partials/common-elements.html'),
        loadComponent('#faq-placeholder', '/partials/faq.html')
    ]).then(() => {
        // REMOVED: setupHeader(), it's now inside Header.vue
        // REMOVED: getCart() and updateCartIcon(), they are now inside Header.vue

        const setupFAQ = () => {
            const faqQuestions = document.querySelectorAll('.faq-question');
            const faqAnswers = document.querySelectorAll('.faq-answer');

            faqQuestions.forEach((question, index) => {
                question.addEventListener('click', () => {
                    question.classList.toggle('active');
                });
            });
        };
        setupFAQ();

        // Modal and Toast logic remains
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

        // The message listener for pop-ups
        window.addEventListener('message', function (event) {
            // A basic security check
            if (event.origin.includes('moretrendz.online') || event.origin.includes('localhost') || event.origin.includes('127.0.0.1')) {
                if (event.data.type === 'cartUpdated') {
                    window.showToast(event.data.message, 'success');
                    //window.showModal('Added to Cart!', event.data.message);
                    window.updateCartIcon(); // Update the cart icon count
                }
            }
        });

        window.updateCartIcon();

        if (typeof initializePageScripts === 'function') {
            initializePageScripts();
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
});