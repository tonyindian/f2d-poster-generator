const fetch = require('node-fetch');
const { validateCSRFToken } = require('./utils/csrf-validator');
const { createRateLimitMiddleware } = require('./utils/rate-limit-middleware');

// Rate Limiter Configuration
const rateLimitMiddleware = createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 3600000,
    onLimitReached: (event, result) => {
        console.error('RATE LIMIT ALERT:', {
            ip: event.headers['x-forwarded-for'],
            timestamp: new Date().toISOString()
        });
    }
});

// 🔒 SICHERE INPUT VALIDATION
function sanitizeInput(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input type');
    }
    
    if (text.length > 10000) throw new Error('Input too long');
    if (text.length < 10) throw new Error('Input too short');
    
    const sanitized = text
        .replace(/[<>\"'&]/g, '')
        .replace(/\b(system|admin|root|exec|eval|script|SELECT|DROP|INSERT|UPDATE|DELETE)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (!sanitized) throw new Error('Input contains only invalid characters');
    return sanitized;
}

// 🚀 OPTIMIZED CLAUDE API CALL - No Retries, Fast Timeout
async function callClaudeAPI(prompt) {
    console.log('🔵 Calling Claude API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout (safer buffer)
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 400, // Increased for complete posts
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('Claude API rate limited');
            } else if (response.status === 500) {
                throw new Error('Claude API server error');
            } else if (response.status === 503) {
                throw new Error('Claude API temporarily unavailable');
            }
            throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
        }

        console.log('🟢 Claude API success');
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Claude API timeout');
        }
        throw error;
    }
}

// 🔒 MAIN HANDLER - STREAMLINED FOR SPEED
exports.handler = async (event, context) => {
    const baseHeaders = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: baseHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: baseHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // 🚀 1. RATE LIMITING CHECK
        const rateLimitResult = await rateLimitMiddleware(event);
        if (!rateLimitResult.allowed) {
            return rateLimitResult.response;
        }
        
        const headers = { ...baseHeaders, ...rateLimitResult.headers };

        // 🔒 2. VALIDATE AUTHORIZATION
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized - missing token' })
            };
        }

        // 🔒 3. VALIDATE CSRF TOKEN  
        const csrfToken = event.headers['x-csrf-token'];
        if (!validateCSRFToken(csrfToken)) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Invalid CSRF token' })
            };
        }

        // 🔒 4. VALIDATE AND SANITIZE INPUT
        const { magazinText } = JSON.parse(event.body);
        const sanitizedText = sanitizeInput(magazinText);

        // 🔒 5. LOG SECURITY EVENT
        console.log('Secure request processed:', {
            timestamp: new Date().toISOString(),
            ip: event.headers['x-forwarded-for'] || 'unknown',
            inputLength: sanitizedText.length,
            remainingRequests: rateLimitResult.headers['X-RateLimit-Remaining']
        });

        // 🤖 6. CLAUDE API CALL - OPTIMIZED PROMPT
        const prompt = `Erstelle einen Social Media Post für FINE TO DINE:

STRUKTUR (erste Zeile = Titel, dann Haupttext, dann Call-to-Action mit "Erlebe", dann Hashtags):

Restaurant Name + Ort - Kernaussage!
Haupttext mit Person/Geschichte und Besonderheiten.

Erlebe [Beschreibung] mit deinem FINE TO DINE Gutschein!

#FINETODINE #[Ort] #[Merkmal]

WICHTIG: Nur plain text, kein Markdown!

ARTIKEL: ${sanitizedText}`;

        // Single API call - no retries for speed
        const response = await callClaudeAPI(prompt);
        const data = await response.json();
        const rawContent = data.content[0].text;

        // 📤 7. RETURN RAW CONTENT (formatting happens client-side or separate function)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                content: rawContent, // Raw content from Claude
                needsFormatting: true, // Flag for client
                timestamp: new Date().toISOString(),
                remaining: rateLimitResult.headers['X-RateLimit-Remaining']
            })
        };

    } catch (error) {
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        console.error('Generate function error:', {
            errorId,
            message: error.message,
            timestamp: new Date().toISOString(),
            ip: event.headers['x-forwarded-for'] || 'unknown'
        });
        
        return {
            statusCode: 500,
            headers: baseHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: error.message.includes('timeout') ? 'Service timeout - please try again' : 'Internal server error',
                errorId
            })
        };
    }
};