// File: vite.config.js

const { defineConfig } = require('vite');
// CORRECTED: We are importing the plugin directly without '.default'
const htmlInject = require('vite-plugin-html-inject'); 

module.exports = defineConfig({
  plugins: [
    // And calling it directly here.
    htmlInject(),
  ],
  build: {
    outDir: 'dist'
  }
});
