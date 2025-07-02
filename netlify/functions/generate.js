// 🚀 FINE TO DINE GENERATOR - Claude 3.5 Sonnet with IMPROVED PROMPT
const fetch = require('node-fetch');

// Simple rate limiting without external dependencies
const rateLimitStore = new Map();

function cleanupRateLimit() {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

function checkRateLimit(identifier, maxRequests = 5, windowMs = 3600000) {
    cleanupRateLimit();
    
    const now = Date.now();
    let record = rateLimitStore.get(identifier);
    
    if (!record || now > record.resetTime) {
        record = {
            count: 0,
            resetTime: now + windowMs
        };
    }
    
    if (record.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime
        };
    }
    
    record.count++;
    rateLimitStore.set(identifier, record);
    
    return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetTime: record.resetTime
    };
}

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

// 🎯 CLAUDE 3.5 SONNET - PROVEN RELIABLE MODEL
async function callClaudeSonnetAPI(prompt) {
    console.log('🔵 Calling Claude 3.5 Sonnet (proven reliable)...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for Netlify
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022', // 🎯 PROVEN WORKING MODEL
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Claude API Error:', response.status, errorText);
            throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
        }

        console.log('🟢 Claude 3.5 Sonnet success!');
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
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
        console.log('🚀 Generate function started');
        
        // Simple rate limiting
        const ip = event.headers['x-forwarded-for'] || 'unknown';
        const rateLimitResult = checkRateLimit(ip);
        
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers: baseHeaders,
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    resetTime: rateLimitResult.resetTime
                })
            };
        }

        // Basic auth check
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid auth header');
            return {
                statusCode: 401,
                headers: baseHeaders,
                body: JSON.stringify({ error: 'Unauthorized - missing token' })
            };
        }

        // Parse request
        let magazinText;
        try {
            const body = JSON.parse(event.body);
            magazinText = body.magazinText;
        } catch (parseError) {
            console.error('❌ Body parsing failed:', parseError);
            return {
                statusCode: 400,
                headers: baseHeaders,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        if (!magazinText) {
            return {
                statusCode: 400,
                headers: baseHeaders,
                body: JSON.stringify({ error: 'No magazinText provided' })
            };
        }

        const sanitizedText = sanitizeInput(magazinText);
        console.log('✅ Input sanitized, length:', sanitizedText.length);

        // Check for required environment variables
        if (!process.env.CLAUDE_API_KEY) {
            console.error('❌ CLAUDE_API_KEY environment variable missing');
            return {
                statusCode: 500,
                headers: baseHeaders,
                body: JSON.stringify({ error: 'Service configuration error' })
            };
        }

        // 🚀 PERFECTED FINE TO DINE PROMPT - Follows exact user style
        const prompt = `Du bist ein Experte für FINE TO DINE Social Media Posts. Erstelle einen Post EXAKT nach diesem Muster:

ZIEL-FORMAT (GENAU BEFOLGEN):
**Restaurant Name Ort** **Titel - Hook mit Überraschung!**
[3-4 Sätze Haupttext mit spezifischen Details, Zahlen, Namen]
[1-2 Sätze über Besonderheiten, Terrasse, Ambiente]
*Erlebe/Entdecke [spezifisches Konzept] mit deinem FINE TO DINE Gutschein!*
#FINETODINE #Ort #RestaurantName #[2-3 spezifische Hashtags]
**Veranstaltungstipp:** [Falls im Artikel erwähnt]

STIL-REGELN:
- Verwende EXAKTE Details und Zahlen aus dem Artikel (Namen, Preise, Daten, etc.)
- Erstelle überraschende Kontraste im Titel (z.B. "Tradition trifft Moderne", "Bodenständig mit Michelin-Stern")
- Schreibe poetisch aber präzise
- Verwende Schweizer Begriffe (z.B. "über Mittag" statt "mittags")
- WICHTIG: Verwende KEIN Markdown (**bold**, *italic*) - nur normalen Text!

BEISPIEL-STRUKTUR:
**Weiherschloss Bottmingen** **Eine Terrasse für alle - zweigeteilt und doch vereint!**
Das Weiherschloss hat sich erfolgreich neu aufgestellt: Seit März 2024 ergänzt die Brasserie du Château das etablierte Gourmetrestaurant Louis perfekt. Gastgeber Peter Kapral empfängt über Mittag mit unkomplizierten Lunchtellern, während abends gemütliche Mehrgänger locken. Die salomonische Lösung für die Sommermonate: Die lauschige Terrasse über dem Burgweiher teilen sich beide Konzepte - 70 Plätze für die Brasserie, 20 für das Gourmet Louis.
*Entdecke beide Konzepte unter einem Dach mit deinem FINE TO DINE Gutschein!*
#FINETODINE #Bottmingen #Weiherschloss #ZweiKonzepte
**Veranstaltungstipp:** 17. AUG 2025: Rock The Castle Vol. VI

ARTIKEL: ${sanitizedText}

Erstelle den Post nach diesem EXAKTEN Format (kein Markdown):`;

        console.log('🤖 Calling Claude 3.5 Sonnet API...');
        const response = await callClaudeSonnetAPI(prompt);
        const data = await response.json();
        
        if (!data || !data.content || !Array.isArray(data.content) || !data.content[0]) {
            console.error('❌ Invalid Claude response structure:', data);
            throw new Error('Invalid response from Claude API');
        }

        const rawContent = data.content[0].text;
        console.log('✅ Content generated, length:', rawContent.length);

        return {
            statusCode: 200,
            headers: baseHeaders,
            body: JSON.stringify({ 
                success: true, 
                content: rawContent,
                model: 'claude-3-5-sonnet-20241022',
                timestamp: new Date().toISOString(),
                remaining: rateLimitResult.remaining
            })
        };

    } catch (error) {
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        console.error('❌ Generate function error:', {
            errorId,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        let userMessage = 'Service temporär nicht verfügbar';
        let statusCode = 500;
        
        if (error.message.includes('timeout')) {
            userMessage = 'Antwort dauert zu lange - bitte versuchen Sie es erneut';
            statusCode = 504;
        } else if (error.message.includes('API Error: 401')) {
            userMessage = 'API-Authentifizierung fehlgeschlagen';
            statusCode = 503;
        } else if (error.message.includes('API Error: 429')) {
            userMessage = 'API-Rate-Limit erreicht - bitte warten Sie einen Moment';
            statusCode = 503;
        }
        
        return {
            statusCode,
            headers: baseHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: userMessage,
                errorId
            })
        };
    }
};