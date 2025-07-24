// File: backend/routes/aiRoutes.js (updated)

const express = require('express');
const router = express.Router();

async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the .env file.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status: ${response.status}, body: ${errorBody}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.warn("Unexpected Gemini API response structure:", result);
            return "Sorry, I couldn't generate a response right now.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

// --- ROUTE FOR AI PRODUCT DESCRIPTION (IMPROVED PROMPT) ---
router.post('/generate-description', async (req, res) => {
    const { productName } = req.body;
    if (!productName) {
        return res.status(400).json({ message: 'Product name is required.' });
    }
    // This prompt is now generic for any trending product
    const prompt = `Write a compelling, short e-commerce product description for a trending product named "${productName}". Use HTML paragraph tags for the output. Be creative, sound exciting, and highlight its key features and why it's popular.`;
    try {
        const description = await callGemini(prompt);
        res.json({ description });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate description from AI.' });
    }
});

// --- ROUTE FOR AI SUGGESTION (IMPROVED PROMPT) ---
router.post('/suggest-outfit', async (req, res) => {
    const { productNames } = req.body;
    if (!productNames || productNames.length === 0) {
        return res.status(400).json({ message: 'Product names are required.' });
    }
    // This prompt now works for any combination of products
    const prompt = `I have these items in my shopping cart: ${productNames.join(', ')}. As a product expert, suggest how these items can be used together or complement each other. Be creative! For example, if it's a kitchen gadget and a toy, suggest a fun family activity. If it's multiple toys, suggest a fun scenario.`;
    try {
        const suggestion = await callGemini(prompt);
        res.json({ suggestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get suggestion from AI.' });
    }
});

module.exports = router;
