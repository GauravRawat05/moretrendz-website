// File: backend/routes/aiRoutes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Call Groq Cloud AI API (Fast & Free)
 */
async function callGroqAI(prompt, systemInstruction = "You are an expert e-commerce copywriter.") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not defined in the .env file.");
    }

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
        model: 'openai/gpt-oss-120b',
        messages: [
            {
                role: 'system',
                content: systemInstruction
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 1024
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
            return content.trim();
        } else {
            console.warn("Unexpected Groq API response structure:", response.data);
            return "Sorry, I couldn't generate a response right now.";
        }
    } catch (error) {
        console.error("Error calling Groq API:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// --- ROUTE FOR AI PRODUCT DESCRIPTION ---
router.post('/generate-description', async (req, res) => {
    const { productName } = req.body;
    if (!productName) {
        return res.status(400).json({ message: 'Product name is required.' });
    }

    const prompt = `Write a compelling, short e-commerce product description for a trending product named "${productName}". Use clean HTML paragraph tags (<p>...</p>) for the output. Be creative, sound exciting, and highlight its key features and why customers love it.`;
    try {
        const description = await callGroqAI(prompt, "You are a professional e-commerce product copywriter. Output only clean HTML tags.");
        res.json({ description });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate description from AI.' });
    }
});

// --- ROUTE FOR AI CART / OUTFIT / BUNDLE SUGGESTION ---
router.post('/suggest-outfit', async (req, res) => {
    const { productNames } = req.body;
    if (!productNames || productNames.length === 0) {
        return res.status(400).json({ message: 'Product names are required.' });
    }

    const prompt = `I have these items in my shopping cart: ${productNames.join(', ')}. As a product expert, suggest how these items can be used together or complement each other. Be creative, helpful, and concise.`;
    try {
        const suggestion = await callGroqAI(prompt, "You are a helpful and friendly shopping assistant.");
        res.json({ suggestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get suggestion from AI.' });
    }
});

module.exports = router;
