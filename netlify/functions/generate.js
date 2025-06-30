const fetch = require('node-fetch');
const { validateCSRFToken } = require('./utils/csrf-validator');
const { createRateLimitMiddleware } = require('./utils/rate-limit-middleware');

// Rate Limiter Configuration
const rateLimitMiddleware = createRateLimitMiddleware({
    maxRequests: 5,           // 5 requests per hour (Claude ist teuer!)
    windowMs: 3600000,        // 1 Stunde
    onLimitReached: (event, result) => {
        // Additional logging/alerting bei Rate Limit
        console.error('RATE LIMIT ALERT:', {
            ip: event.headers['x-forwarded-for'],
            timestamp: new Date().toISOString(),
            resetTime: new Date(result.resetTime).toISOString()
        });
    }
});

// Unicode Character Maps - VOLLSTÄNDIG
const UNICODE_BOLD = {
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
    'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
    'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
    'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
    'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
    'ä': '𝐚̈', 'ö': '𝐨̈', 'ü': '𝐮̈', 'Ä': '𝐀̈', 'Ö': '𝐎̈', 'Ü': '𝐔̈', 'ß': '𝐬𝐬',
    '-': '-', ' ': ' ', '!': '!', '.': '.', ',': ',', ':': ':', ';': ';', '?': '?', 
    '(': '(', ')': ')', '[': '[', ']': ']', '/': '/', '&': '&', '@': '@', '#': '#',
    '€': '€', '%': '%', '+': '+', '=': '=', '*': '*', '"': '"', "'": "'", '`': '`'
};

const UNICODE_ITALIC = {
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑',
    'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛',
    'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫',
    'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵',
    'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
    '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫',
    'ä': '𝘢̈', 'ö': '𝘰̈', 'ü': '𝘶̈', 'Ä': '𝘈̈', 'Ö': '𝘖̈', 'Ü': '𝘜̈', 'ß': '𝘴𝘴',
    '-': '-', ' ': ' ', '!': '!', '.': '.', ',': ',', ':': ':', ';': ';', '?': '?',
    '(': '(', ')': ')', '[': '[', ']': ']', '/': '/', '&': '&', '@': '@', '#': '#',
    '€': '€', '%': '%', '+': '+', '=': '=', '*': '*', '"': '"', "'": "'", '`': '`'
};

// Unicode-Formatierungs-Funktionen
function toBold(text) {
    return text.split('').map(char => UNICODE_BOLD[char] || char).join('');
}

function toItalic(text) {
    return text.split('').map(char => UNICODE_ITALIC[char] || char).join('');
}

// FINALE ROBUSTE FINE TO DINE Post Unicode-Formatierung
function applyFineToDineFormatting(text) {
    let formatted = text.trim();
    
    // SCHRITT 0: Markdown-Bereinigung (Claude generiert oft **bold** markdown)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1'); // **text** → text
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');     // *text* → text
    
    // SCHRITT 1: TITEL-FORMATIERUNG (erste Zeile als Bold)
    const lines = formatted.split('\n');
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.length > 0) {
            const boldTitle = toBold(firstLine);
            // Erste Zeile exakt ersetzen
            lines[0] = boldTitle;
            formatted = lines.join('\n');
        }
    }
    
    // SCHRITT 2: CTA-FORMATIERUNG (Zeilen die "Erlebe" enthalten)
    const processedLines = formatted.split('\n').map(line => {
        // Suche nach Zeilen die "Erlebe" enthalten
        if (line.includes('Erlebe')) {
            // Finde "Erlebe" Position und formatiere von dort bis Zeilenende
            const erlebeIndex = line.indexOf('Erlebe');
            if (erlebeIndex !== -1) {
                const beforeErlebe = line.substring(0, erlebeIndex);
                const erlebeAndAfter = line.substring(erlebeIndex);
                return beforeErlebe + toItalic(erlebeAndAfter);
            }
        }
        return line;
    });
    
    return processedLines.join('\n');
}

// 🔒 SICHERE INPUT VALIDATION
function sanitizeInput(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input type');
    }
    
    // Length validation
    if (text.length > 10000) {
        throw new Error('Input too long');
    }
    
    if (text.length < 10) {
        throw new Error('Input too short');
    }
    
    // Remove potentially dangerous patterns
    const sanitized = text
        .replace(/[<>\"'&]/g, '') // XSS prevention
        .replace(/\b(system|admin|root|exec|eval|script|SELECT|DROP|INSERT|UPDATE|DELETE)\b/gi, '') // Injection prevention
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    if (!sanitized) {
        throw new Error('Input contains only invalid characters');
    }
    
    return sanitized;
}

// 🔒 MAIN HANDLER MIT VOLLSTÄNDIGER SECURITY
exports.handler = async (event, context) => {
    // Standard headers
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
        // 🚀 1. RATE LIMITING CHECK (FIRST!)
        const rateLimitResult = await rateLimitMiddleware(event);
        if (!rateLimitResult.allowed) {
            return rateLimitResult.response;
        }
        
        // Add rate limit headers to base headers
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
            console.error('Invalid CSRF token:', csrfToken ? 'provided' : 'missing');
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
            userAgent: event.headers['user-agent'] || 'unknown',
            inputLength: sanitizedText.length,
            remainingRequests: rateLimitResult.headers['X-RateLimit-Remaining']
        });

        // 🤖 6. CLAUDE API CALL (unverändert)
        const prompt = `Erstelle einen Social Media Post für Facebook/Instagram im FINE TO DINE Stil:

DENKE IN DIESEN ELEMENTEN:
1. TITEL: Restaurant Name + Ort + Kernaussage (erste Zeile)
2. HAUPTTEXT: Personen/Geschichte, dann Besonderheiten, dann Details
3. CALL-TO-ACTION: Beginnt mit "Erlebe" und erwähnt "FINE TO DINE Gutschein"
4. VERANSTALTUNGSTIPPS: Falls relevant aus dem Artikel
5. HASHTAGS: #FINETODINE + Ort + spezifische Merkmale

STIL-REGELN:
- Sprache: Emotionale Adjektive, konkrete Details
- Struktur: Personen/Geschichte, dann Besonderheiten, dann Details
- Call-to-Action muss mit "Erlebe" beginnen
- WICHTIG: Verwende KEIN Markdown (**bold** oder *italic*) - nur normalen Text!

BEISPIEL-STRUKTUR:
Restaurant Truube Gais - Bodenständigkeit mit Michelin-Stern!
Silvia Manser verzaubert mit grundehrlicher und weltoffener Küche. Erstklassige regionale Produkte, bedingungslose Frische - vom Amuse-Bouche bis zu hausgemachten Friandises.

Erlebe weltoffene Bodenständigkeit auf Sterne-Niveau mit deinem FINE TO DINE Gutschein!

#FINETODINE #Gais #MichelinStern #GaultMillau

ARTIKEL: ${sanitizedText}

Erstelle den Post mit dieser exakten Struktur (nur plain text, kein Markdown):`;

console.log('🔵 Starting Claude API call...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        console.log('🔵 Claude API finished');

        if (!response.ok) {
            throw new Error(`Claude API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔵 JSON parsed');
        const rawContent = data.content[0].text;
        console.log('🔵 Content extracted');

        // STEP 2: JavaScript wendet zuverlässige Unicode-Formatierung an
        const formattedContent = applyFineToDineFormatting(rawContent);
        console.log('🔵 Formatting finished');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                content: formattedContent,
                timestamp: new Date().toISOString(),
                remaining: rateLimitResult.headers['X-RateLimit-Remaining']
            })
        };

    } catch (error) {
        // 🔒 SECURE ERROR HANDLING
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        console.error('Secure function error:', {
            errorId,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ip: event.headers['x-forwarded-for'] || 'unknown'
        });
        
        return {
            statusCode: 500,
            headers: baseHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: 'Internal server error',
                errorId // Für Support-Tickets
            })
        };
    }
};