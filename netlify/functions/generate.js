// 🚀 OPTIMIZED FINE TO DINE GENERATOR - 2025 BEST PRACTICES INTEGRATED
// Based on research from Anthropic, Google AI, AWS, and leading prompt engineering experts

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
                max_tokens: 500, // Increased for detailed FINE TO DINE style
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
        // Rate limiting, auth, and CSRF validation
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

        console.log('🚀 Using Claude 3.5 Haiku with 2025 best practices:', {
            timestamp: new Date().toISOString(),
            inputLength: sanitizedText.length
        });

        // 🚀 OPTIMIZED FINE TO DINE PROMPT - 2025 BEST PRACTICES INTEGRATED
        const prompt = `Du bist ein erfahrener Magazin-Autor für luxuriöse Gastronomie-Publikationen. Deine Aufgabe ist es, einen Social Media Post für FINE TO DINE zu erstellen, der die Truube-Qualität als Gold-Standard erreicht.

<task_context>
Erstelle einen Social Media Post im luxuriösen Magazin-Stil für FINE TO DINE, basierend auf dem bereitgestellten Artikel.
</task_context>

<tone_context>
Sophisticated, warm, einladend - wie ein erstklassiges Gastronomie-Magazin. Verwende poetische Sprache und emotionale Tiefe.
</tone_context>

<detailed_instructions>
STRUKTUR (GOLD-STANDARD):
1. TITEL: Restaurant + Ort - Überraschender Kontrast/Hook! (wird zu Unicode Bold Serif)
2. HAUPTTEXT: 5-6 substantielle Sätze mit Tiefe (normaler Text)  
3. CTA: Kreative "Erlebe [spezifisches Konzept] mit deinem FINE TO DINE Gutschein!" (wird zu Unicode Italic)
4. HASHTAGS: #FINETODINE #[Ort] #[Spezifika]

DENKE SCHRITT FÜR SCHRITT:
<thinking>
1. Analysiere den Artikel nach einzigartigen Details
2. Identifiziere überraschende Kontraste für den Titel
3. Finde die Küchenphilosophie und Besonderheiten
4. Entwickle poetische Phrasen aus den Fakten
5. Erstelle emotionale Verbindungen zu den Lesern
</thinking>
</detailed_instructions>

<examples>
GOLD-STANDARD BEISPIEL (TRUUBE-QUALITÄT):
"𝐁𝐨𝐝𝐞𝐧𝐬𝐭𝐚̈𝐧𝐝𝐢𝐠𝐤𝐞𝐢𝐭 𝐦𝐢𝐭 𝐌𝐢𝐜𝐡𝐞𝐥𝐢𝐧-𝐒𝐭𝐞𝐫𝐧!
Silvia Manser, eine der wenigen Spitzenköchinnen im Land, verzaubert in ihrem mit einem Michelin-Stern und 17 Gault-Millau-Punkten ausgezeichneten Restaurant Truube in Gais. Aber keine Bange: Hier erwartet Gäste keine überkandidelte Kulinarik, sondern grundehrliche und gleichsam weltoffene Küche mit viel Einfallsreichtum. In der schlicht-eleganten Gaststube basiert alles auf erstklassigen, regionalen Produkten und bedingungsloser Frische - vom Amuse-Bouche bis zu hausgemachten Friandises. Die umliegende Appenzeller Natur inspiriert, aber auch Köstlichkeiten aus aller Welt fliessen mit Fingerspitzengefühl ein. Besonderes Erlebnis: der Gasttisch neben der Küche für Live-Einblicke!
𝘌𝘳𝘭𝘦𝘣𝘦 𝘚𝘱𝘪𝘵𝘻𝘦𝘯𝘬𝘶̈𝘤𝘩𝘦 𝘮𝘪𝘵 𝘥𝘦𝘪𝘯𝘦𝘮 𝘍𝘐𝘕𝘌 𝘛𝘖 𝘋𝘐𝘕𝘌 𝘎𝘶𝘵𝘴𝘤𝘩𝘦𝘪𝘯!
#FINETODINE #Gais #MichelinStern #GaultMillau #Spitzenköchin #WeltoffeneKüche"
</examples>

<advanced_techniques>
ZWINGEND ZU VERWENDENDE SPRACH-TECHNIKEN:
- **Überraschende Kontraste**: "Bodenständigkeit mit Michelin-Stern", "grundehrlich und weltoffene"
- **Beruhigende Einschübe**: "Aber keine Bange:", "keine Sorge:", "keine überkandidelte..."
- **Chef-Würdigung**: "eine der wenigen...", "meisterhaft...", "virtuos..."
- **Spezifische Auszeichnungen**: Punkte, Sterne, Awards mit Zahlen (NUR AUS ARTIKEL!)
- **Poetische Phrasen**: "mit Fingerspitzengefühl", "mit viel Einfallsreichtum"
- **Sinnliche Details**: Produktqualität, Frische, Zubereitung
- **Besondere Erlebnisse**: Einzigartige Features des Restaurants
- **Philosophische Tiefe**: Küchenphilosophie, Ansatz, Vision

TITEL-HOOKS (ÜBERRASCHEND):
- "[Unerwartete Kombination]!" 
- "[Kontrast] mit [Prestige]!"
- "[Emotion] im [Ort]!"
- "[Sinnlicher Begriff] [Location]!"
</advanced_techniques>

<constraints>
KRITISCH WICHTIG - FAKTENTREUE:
- VERWENDE NUR FAKTEN AUS DEM ARTIKEL
- ERFINDE KEINE Details, Namen, Orte, Preise, Auszeichnungen
- KEINE FANTASIE-ELEMENTE oder Vermutungen
- Wenn Infos fehlen → elegante, allgemeine Beschreibung
- AUTHENTIZITÄT hat oberste Priorität

VERMEIDE:
- Oberflächliche Beschreibungen
- Corporate-Sprache ("bietet", "präsentiert")
- Generische Hooks
- Kurze Posts ohne Tiefe
- Erfundene Details
</constraints>

<output_format>
Erstelle den Post in folgendem Format:
- Titel in Unicode Bold Serif (𝐁𝐨𝐥𝐝 𝐒𝐞𝐫𝐢𝐟)
- Haupttext in normaler Schrift
- CTA in Unicode Italic (𝘐𝘵𝘢𝘭𝘪𝘤)
- Hashtags am Ende

LÄNGE: Mindestens 5-6 substantielle, detailreiche Sätze für Magazin-Qualität!
</output_format>

<document>
${sanitizedText}
</document>`;

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