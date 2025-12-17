const express = require('express');
const path = require('path');

// Import the analyze function using dynamic import for ES modules
let analyzeCVLocally;

async function loadAnalyzeFunction() {
    const module = await import('./api/analyze.js');
    analyzeCVLocally = module.analyzeCVLocally;
}

const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API routes
app.post('/api/analyze', async (req, res) => {
    try {
        if (!analyzeCVLocally) {
            await loadAnalyzeFunction();
        }

        const { cvText } = req.body;

        if (!cvText) {
            return res.status(400).json({ error: 'cvText is required' });
        }

        // CORS headers
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Análisis inteligente local (100% gratuito)
        const result = analyzeCVLocally(cvText);
        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in /api/analyze:', error);
        res.status(500).json({
            error: 'Error analyzing CV',
            details: error.message
        });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'talentmatch-code.html'));
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
