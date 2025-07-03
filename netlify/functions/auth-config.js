exports.handler = async (event, context) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://f2d-poster-generator.netlify.app';
    
    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
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
        // Validate required environment variables
        if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
            throw new Error('Missing required Auth0 configuration');
        }

        const config = {
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: `${allowedOrigin}/app/`
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