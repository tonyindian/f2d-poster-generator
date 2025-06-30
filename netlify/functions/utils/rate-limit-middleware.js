const { rateLimiter } = require('./rate-limiter');
const crypto = require('crypto');

function createRateLimitMiddleware(options = {}) {
    const {
        maxRequests = 3,           // Requests pro Zeitfenster
        windowMs = 3600000,         // 1 Stunde in Milliseconds
        keyGenerator = defaultKeyGenerator,
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        onLimitReached = null
    } = options;
    
    return function rateLimitMiddleware(event) {
        const identifier = keyGenerator(event);
        const result = rateLimiter.checkLimit(identifier, maxRequests, windowMs);
        
        const headers = {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
        };
        
        if (!result.allowed) {
            headers['Retry-After'] = result.retryAfter.toString();
            
            // Log rate limit exceeded
            console.warn('Rate limit exceeded:', {
                identifier: identifier.substring(0, 8) + '...', // Partial für Privacy
                limit: maxRequests,
                resetTime: new Date(result.resetTime).toISOString(),
                ip: event.headers['x-forwarded-for'] || 'unknown',
                userAgent: event.headers['user-agent'] || 'unknown'
            });
            
            if (onLimitReached) {
                onLimitReached(event, result);
            }
            
            return {
                allowed: false,
                response: {
                    statusCode: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
                        ...headers
                    },
                    body: JSON.stringify({
                        error: 'Too Many Requests',
                        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
                        retryAfter: result.retryAfter
                    })
                }
            };
        }
        
        return {
            allowed: true,
            headers
        };
    };
}

// Default key generator - combines IP and User Agent for better accuracy
function defaultKeyGenerator(event) {
    const ip = event.headers['x-forwarded-for'] || 'unknown';
    const userAgent = event.headers['user-agent'] || 'unknown';
    const authHeader = event.headers.authorization || '';
    
    // Use auth token if available (more accurate per-user limiting)
    if (authHeader.startsWith('Bearer ')) {
        // Hash the token for privacy
        const hashedToken = crypto
            .createHash('sha256')
            .update(authHeader)
            .digest('hex')
            .substring(0, 16);
        return `auth:${hashedToken}`;
    }
    
    // Fallback to IP + User Agent hash
    return `ip:${ip}:${crypto.createHash('md5').update(userAgent).digest('hex').substring(0, 8)}`;
}

module.exports = { createRateLimitMiddleware };