const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    const { magazinText } = JSON.parse(event.body);
    
    if (!magazinText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No text provided' })
      };
    }

    const prompt = `Erstelle einen Social Media Post für Facebook/Instagram im FINE TO DINE Stil:

STIL-REGELN:
- Titel: Restaurant Name + Ort + Kernaussage
- Struktur: Personen/Geschichte, dann Besonderheiten, dann Details
- Sprache: Emotionale Adjektive, konkrete Details
- Call-to-Action: "Erlebe [Beschreibung] mit deinem FINE TO DINE Gutschein!"
- Hashtags: #FINETODINE + Ort + spezifische Merkmale

BEISPIEL:
"Restaurant Truube Gais - Bodenständigkeit mit Michelin-Stern!
Silvia Manser verzaubert mit grundehrlicher und weltoffener Küche. Erstklassige regionale Produkte, bedingungslose Frische - vom Amuse-Bouche bis zu hausgemachten Friandises.

Erlebe weltoffene Bodenständigkeit auf Sterne-Niveau mit deinem FINE TO DINE Gutschein!

#FINETODINE #Gais #MichelinStern #GaultMillau"

ARTIKEL: ${magazinText}

Erstelle den Post:`;

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

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        content: data.content[0].text,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};