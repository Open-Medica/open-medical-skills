const fetch = globalThis.fetch;

/**
 * Middleware to validate API key by checking with the backend service
 */
async function validateApiKey(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({
                error: 'API key required',
                timestamp: new Date().toISOString(),
                service: 'medikode-mcp-server'
            });
        }
        const backendUrl = process.env.BACKEND_SERVICE_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/validate-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: apiKey })
        });
        if (!response.ok) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        const validationResult = await response.json();
        if (!validationResult.valid) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        req.apiKeyData = validationResult.keyData;
        next();
    } catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({ error: 'API key validation failed' });
    }
}

module.exports = { validateApiKey };
