// File: js/config.js
// Dynamically determine the backend API URL depending on environment

export const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000/api'
    : 'https://mt-backend-bvzf.onrender.com/api';

if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}
