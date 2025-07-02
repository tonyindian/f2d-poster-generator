// 🎨 UNICODE FORMATTING FUNCTION - Separate & Fast
// This function handles only the Unicode formatting step

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

// FINE TO DINE Post Unicode-Formatierung
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
            lines[0] = boldTitle;
            formatted = lines.join('\n');
        }
    }
    
    // SCHRITT 2: CTA-FORMATIERUNG (Zeilen die "Erlebe" enthalten)
    const processedLines = formatted.split('\n').map(line => {
        if (line.includes('Erlebe')) {
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

// INPUT VALIDATION für Formatting
function validateFormatInput(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a string');
    }
    
    if (text.length > 5000) {
        throw new Error('Text too long for formatting');
    }
    
    if (text.length < 5) {
        throw new Error('Text too short for formatting');
    }
    
    return text.trim();
}

// 🚀 MAIN HANDLER - ULTRA FAST FORMATTING ONLY
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const { content } = JSON.parse(event.body);
        
        // Validate input
        const validatedContent = validateFormatInput(content);
        
        // Apply formatting (this is super fast - no external API calls)
        console.log('🎨 Applying Unicode formatting...');
        const formattedContent = applyFineToDineFormatting(validatedContent);
        console.log('✅ Formatting completed');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                content: formattedContent,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Formatting error:', error);
        
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Formatting failed'
            })
        };
    }
};