exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://f2d-poster-generator.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300'
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
        // Domain-Validation entfernt für jetzt
        const config = {
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: `${process.env.ALLOWED_ORIGIN}/app/`
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
        };

    } catch (error) {
        console.error('Auth config error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Configuration unavailable' })
        };
    }
};