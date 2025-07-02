// 🚀 ULTIMATE SOLUTION: Claude 3.5 Haiku for Speed + Reliability
// Based on research: Haiku is 2x faster with 3.8x lower cost

const fetch = require('node-fetch');
const { validateCSRFToken } = require('./utils/csrf-validator');
const { createRateLimitMiddleware } = require('./utils/rate-limit-middleware');

const rateLimitMiddleware = createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 3600000
});

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

// 🚀 CLAUDE 3.5 HAIKU - ULTRA FAST & RELIABLE
async function callClaudeHaikuAPI(prompt) {
    console.log('🔵 Calling Claude 3.5 Haiku (ultra-fast)...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s - generous for Haiku
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022', // 🚀 HAIKU = 2x faster!
                max_tokens: 300, // Optimal for social posts
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Claude Haiku API Error:', response.status, errorText);
            throw new Error(`Claude API Error: ${response.status}`);
        }

        console.log('🟢 Claude 3.5 Haiku success (ultra-fast!)');
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Claude API timeout');
        }
        throw error;
    }
}

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
        // Rate limiting, auth, and CSRF validation (same as before)
        const rateLimitResult = await rateLimitMiddleware(event);
        if (!rateLimitResult.allowed) return rateLimitResult.response;
        
        const headers = { ...baseHeaders, ...rateLimitResult.headers };

        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized - missing token' })
            };
        }

        const csrfToken = event.headers['x-csrf-token'];
        if (!validateCSRFToken(csrfToken)) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Invalid CSRF token' })
            };
        }

        const { magazinText } = JSON.parse(event.body);
        const sanitizedText = sanitizeInput(magazinText);

        console.log('🚀 Using Claude 3.5 Haiku for speed:', {
            timestamp: new Date().toISOString(),
            inputLength: sanitizedText.length
        });

        // 🚀 OPTIMIZED PROMPT FOR HAIKU (shorter = faster)
        const prompt = `Erstelle einen Social Media Post für FINE TO DINE:

STRUKTUR (4 Zeilen):
1. Restaurant + Ort - Hauptmerkmal!
2. Kurze Küchen-Beschreibung
3. "Erlebe [X] mit deinem FINE TO DINE Gutschein!"
4. #FINETODINE #[Ort] #[Merkmal]

Nur plain text, max 250 Zeichen!

ARTIKEL: ${sanitizedText}`;

        // Ultra-fast Haiku API call
        const response = await callClaudeHaikuAPI(prompt);
        const data = await response.json();
        const rawContent = data.content[0].text;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                content: rawContent,
                model: 'claude-3-5-haiku-20241022',
                timestamp: new Date().toISOString(),
                remaining: rateLimitResult.headers['X-RateLimit-Remaining']
            })
        };

    } catch (error) {
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        console.error('Haiku generation error:', {
            errorId,
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        let userMessage = 'Service temporär nicht verfügbar';
        if (error.message.includes('timeout')) {
            userMessage = 'Antwort dauert zu lange - bitte versuchen Sie es erneut';
        }
        
        return {
            statusCode: 500,
            headers: baseHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: userMessage,
                errorId
            })
        };
    }
};