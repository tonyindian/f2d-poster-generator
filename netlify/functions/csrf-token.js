const crypto = require('crypto');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Validate Authorization header
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        // Generate CSRF token
        const csrfToken = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now();
        
        // Create signed token with secret
        const payload = `${csrfToken}:${timestamp}`;
        const signature = crypto
            .createHmac('sha256', process.env.CSRF_SECRET)
            .update(payload)
            .digest('hex');
        
        const signedToken = `${payload}:${signature}`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                token: signedToken,
                expiresIn: 3600000 // 1 hour in milliseconds
            })
        };

    } catch (error) {
        console.error('CSRF token generation failed:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Token generation failed' })
        };
    }
};