import { createApp } from 'vue';
import Reviews from './components/Reviews.vue'; // Import your new component

// This creates a Vue app and mounts the Reviews component
// onto the element with the id="reviews-section"
createApp(Reviews).mount('#reviews-section-placeholder');

// You can keep your other product page logic here, or gradually move it
// into Vue components as well.