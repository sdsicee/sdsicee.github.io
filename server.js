// Secure Node.js Proxy Server for AI Mastering Engine
// This server securely handles API requests to the Gemini API.

// 1. --- Dependencies ---
// Make sure you have Node.js installed.
// Run `npm init -y` in your terminal in a new project folder.
// Then run `npm install express node-fetch cors dotenv` to install the necessary packages.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // This allows us to use a .env file for the API key

// 2. --- Server Setup ---
const app = express();
const PORT = process.env.PORT || 3000; // Use the port from environment variables or default to 3000

// 3. --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Enable the server to parse JSON request bodies

// 4. --- API Proxy Route ---
// This is the single endpoint your frontend will call.
app.post('/api/master', async (req, res) => {
    try {
        // Get the prompt from the request body sent by your frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Securely get the API key from server environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // This error will only show on your server console, not to the user.
            console.error("Gemini API key not found in environment variables.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Forward the request to the Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!geminiResponse.ok) {
            // Forward the error from the Gemini API back to the client
            const errorData = await geminiResponse.json();
            console.error("Error from Gemini API:", errorData);
            return res.status(geminiResponse.status).json(errorData);
        }

        const data = await geminiResponse.json();
        
        // Send the successful response from Gemini back to your frontend
        res.status(200).json(data);

    } catch (error) {
        console.error('Error in proxy server:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// 5. --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Secure proxy server running on port ${PORT}`);
    console.log('Ready to forward requests to the Gemini API.');
});
