<template>
  <section class="py-16 sm:py-24 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold tracking-tight text-black">Customer Reviews</h2>
        <button @click="toggleReviewForm" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Write a Review
        </button>
      </div>

      <div v-if="isFormVisible" class="mt-8">
        <form @submit.prevent="submitReview" class="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 class="text-lg font-semibold">Write a review</h3>
          <div>
            <label for="review-author" class="block text-sm font-medium">Your Name</label>
            <input v-model="newReview.author" type="text" id="review-author" required class="w-full border p-2 mt-1 rounded-md">
          </div>
          <div>
            <label class="block text-sm font-medium">Your Rating</label>
            <div class="rating mt-1">
              <input type="radio" id="star5" v-model="newReview.rating" value="5" required/><label for="star5"></label>
              <input type="radio" id="star4" v-model="newReview.rating" value="4"/><label for="star4"></label>
              <input type="radio" id="star3" v-model="newReview.rating" value="3"/><label for="star3"></label>
              <input type="radio" id="star2" v-model="newReview.rating" value="2"/><label for="star2"></label>
              <input type="radio" id="star1" v-model="newReview.rating" value="1"/><label for="star1"></label>
            </div>
          </div>
          <div>
            <label for="review-text" class="block text-sm font-medium">Your Review</label>
            <textarea v-model="newReview.text" id="review-text" rows="4" required class="w-full border p-2 mt-1 rounded-md"></textarea>
          </div>
          <button type="submit" class="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800">Submit Review</button>
        </form>
      </div>

      <div class="mt-12 space-y-8">
        <p v-if="isLoading" class="text-center text-gray-500">Loading reviews...</p>
        <p v-else-if="error" class="text-center text-red-500">{{ error }}</p>
        <p v-else-if="reviews.length === 0" class="text-center text-gray-500">There are no reviews yet.</p>
        <div v-else v-for="review in reviews" :key="review._id" class="p-6 bg-white rounded-lg shadow">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold">{{ review.author }}</p>
            <div class="flex items-center" v-html="renderStars(review.rating)"></div>
          </div>
          <p class="mt-4 text-gray-600">{{ review.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';

const reviews = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isFormVisible = ref(false);
const newReview = reactive({ author: '', rating: null, text: '' });
const productId = new URLSearchParams(window.location.search).get('id');

const fetchReviews = async () => {
  try {
    isLoading.value = true;
    const response = await fetch(`https://moretrendz-backend.onrender.com/api/reviews/product/${productId}`);
    if (!response.ok) throw new Error('Could not load reviews.');
    reviews.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchReviews);

const toggleReviewForm = () => { isFormVisible.value = !isFormVisible.value; };

const submitReview = async () => {
  if (!newReview.rating) { if (window.showModal) window.showModal('Input Error', 'Please select a star rating.');
    else alert('Please select a star rating.'); return; }
  try {
    const response = await fetch('https://moretrendz-backend.onrender.com/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newReview, productId })
    });
    if (!response.ok) throw new Error('Failed to submit review.');
    newReview.author = ''; newReview.rating = null; newReview.text = '';
    isFormVisible.value = false;
    await fetchReviews();
    if (window.showModal) window.showModal('Success!', 'Thank you! Your review has been submitted.');
    else alert('Thank you! Your review has been submitted.');
    } catch (err) {
      if (window.showModal) window.showModal('Error', err.message);
      else alert(err.message);
    }
};

const renderStars = (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? 'text-yellow-400' : 'text-gray-300';
        stars += `<svg class="w-5 h-5 ${starClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.445a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.445a1 1 0 00-1.175 0l-3.367 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/></svg>`;
    }
    return stars;
};
</script>

<style scoped>
.rating input { display: none; }
.rating label { float: right; cursor: pointer; color: #d1d5db; transition: color 0.2s; }
.rating label:before { content: '★'; font-size: 2rem; }
.rating input:checked ~ label, .rating label:hover, .rating label:hover ~ label { color: #f59e0b; }
</style>