// Secure Node.js Proxy Server for AI Mastering Engine
// This server securely handles API requests to the Gemini API.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- FIX: More specific CORS configuration ---
// This explicitly allows requests from all origins, which is often
// necessary for services like Render.
const corsOptions = {
  origin: '*',
  methods: 'POST',
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

// Add a simple root route to check if the server is running
app.get('/', (req, res) => {
    res.status(200).send('AI Mastering Proxy is running!');
});


app.post('/api/master', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key not found in environment variables.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Error from Gemini API:", data);
            return res.status(geminiResponse.status).json(data);
        }
        
        res.status(200).json(data);

    } catch (error) {
        console.error('Error in proxy server:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Secure proxy server running on port ${PORT}`);
});
