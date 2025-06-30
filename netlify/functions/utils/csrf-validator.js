const crypto = require('crypto');

function validateCSRFToken(token, maxAge = 3600000) { // 1 hour default
    if (!token || typeof token !== 'string') {
        return false;
    }

    try {
        const parts = token.split(':');
        if (parts.length !== 3) {
            return false;
        }

        const [csrfToken, timestamp, signature] = parts;
        
        // Check timestamp (prevent replay attacks)
        const now = Date.now();
        const tokenTime = parseInt(timestamp, 10);
        if (now - tokenTime > maxAge) {
            console.log('CSRF token expired');
            return false;
        }

        // Verify signature
        const payload = `${csrfToken}:${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CSRF_SECRET)
            .update(payload)
            .digest('hex');

        // Use crypto.timingSafeEqual to prevent timing attacks
        const tokenBuffer = Buffer.from(signature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
        
        if (tokenBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);

    } catch (error) {
        console.error('CSRF validation error:', error);
        return false;
    }
}

module.exports = { validateCSRFToken };