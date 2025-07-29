// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Scans all HTML files in the root
    "./public/**/*.html", // Scans all HTML files inside the public folder
    "./js/**/*.js", // <-- ADD THIS LINE
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};