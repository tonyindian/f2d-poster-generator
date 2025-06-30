// 🔒 SCHRITT 1: SICHERE AUTH0 KONFIGURATION

// ==========================================
// 1. NEUE NETLIFY FUNCTION: /auth/config
// ==========================================
// Datei: netlify/functions/auth-config.js

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://yourdomain.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300' // 5 min cache
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
        // Validate domain to prevent config leakage
        const referer = event.headers.referer || event.headers.origin;
        const allowedDomains = [
            process.env.ALLOWED_ORIGIN,
            'https://f2d-poster-generator.netlify.app',
            'http://localhost:3000' // für Development
        ];

        if (!allowedDomains.some(domain => referer?.startsWith(domain))) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Forbidden' })
            };
        }

        // Sichere Auth0 Config (nur public-safe Werte)
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

// ==========================================
// 2. SICHERE CLIENT-SIDE IMPLEMENTATION
// ==========================================
// Für app/index.html und login.html

class SecureAuthManager {
    #auth0Client = null;
    #user = null;
    #config = null;
    
    constructor() {
        this.#initializeAuth();
        this.#bindEvents();
    }
    
    async #loadSecureConfig() {
        try {
            const response = await fetch('/.netlify/functions/auth-config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Config load failed: ${response.status}`);
            }
            
            this.#config = await response.json();
            return this.#config;
            
        } catch (error) {
            console.error('🚨 Failed to load Auth0 config:', error);
            this.#showError('Authentication system unavailable. Please try again later.');
            throw error;
        }
    }
    
    async #initializeAuth() {
        try {
            console.log('🔐 Loading secure Auth0 configuration...');
            
            // Config von sicherem Endpoint laden
            await this.#loadSecureConfig();
            
            // Auth0 Client mit sicherer Config erstellen
            this.#auth0Client = await auth0.createAuth0Client(this.#config);
            console.log('✅ Auth0 client created securely');
            
            // Handle OAuth callback
            if (window.location.search.includes('code=')) {
                console.log('🔄 Handling OAuth callback...');
                try {
                    await this.#auth0Client.handleRedirectCallback();
                    console.log('✅ Callback handled successfully');
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (callbackError) {
                    console.error('❌ Callback handling failed:', callbackError);
                    
                    if (callbackError.message.includes('Invalid state') || 
                        callbackError.message.includes('state')) {
                        console.log('🔧 State error detected - clearing cache');
                        window.history.replaceState({}, document.title, window.location.pathname);
                        await this.#clearAuth0Cache();
                        this.#redirectToLogin();
                        return;
                    }
                    throw callbackError;
                }
            }
            
            // Check authentication status
            console.log('🔐 Checking authentication status...');
            if (await this.#auth0Client.isAuthenticated()) {
                console.log('✅ User is authenticated');
                this.#user = await this.#auth0Client.getUser();
                this.#showApp();
            } else {
                console.log('❌ User not authenticated');
                this.#redirectToLogin();
            }
            
        } catch (error) {
            console.error('💥 Auth0 initialization failed:', error);
            await this.#clearAuth0Cache();
            this.#showError('Authentication system failed. Please contact support if this persists.');
        }
    }
    
    async #clearAuth0Cache() {
        try {
            console.log('🧹 Clearing Auth0 cache...');
            
            // Alle Auth0-bezogenen Storage-Einträge löschen
            const keysToRemove = Object.keys(localStorage).filter(key =>
                key.startsWith('@@auth0spajs@@') ||
                key.includes('auth0') ||
                key.includes(this.#config?.clientId) ||
                key.includes(this.#config?.domain?.split('.')[0])
            );
            
            keysToRemove.forEach(key => {
                console.log('🗑️ Removing:', key);
                localStorage.removeItem(key);
            });
            
            // Session Storage auch clearen
            const sessionKeys = Object.keys(sessionStorage).filter(key =>
                key.startsWith('@@auth0spajs@@') || key.includes('auth0')
            );
            sessionKeys.forEach(key => sessionStorage.removeItem(key));
            
            this.#user = null;
            console.log('✅ Auth0 cache cleared');
            
        } catch (error) {
            console.error('⚠️ Cache clearing failed:', error);
        }
    }
    
    // ... rest of the methods remain the same
    #showApp() {
        document.getElementById('authLoading')?.classList.add('hidden');
        document.getElementById('mainApp')?.classList.add('visible');
        this.#loadUserProfile();
    }
    
    #redirectToLogin() {
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    }
    
    #showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
            
            setTimeout(() => {
                errorElement.classList.remove('active');
            }, 10000); // Längere Anzeige für wichtige Errors
        }
    }
    
    // Sichere Token-Erstellung für API calls
    async getSecureToken() {
        try {
            if (!this.#auth0Client) {
                throw new Error('Auth0 client not initialized');
            }
            
            const token = await this.#auth0Client.getTokenSilently({
                audience: process.env.AUTH0_AUDIENCE, // Falls verwendet
                scope: 'read:posts write:posts'
            });
            
            return token;
            
        } catch (error) {
            console.error('Token retrieval failed:', error);
            // Auto-logout bei Token-Problemen
            await this.logout();
            throw error;
        }
    }
    
    async logout() {
        try {
            await this.#clearAuth0Cache();
            
            if (this.#auth0Client && this.#config) {
                const logoutUrl = `https://${this.#config.domain}/v2/logout?` +
                    `client_id=${this.#config.clientId}&` +
                    `returnTo=${encodeURIComponent(`${window.location.origin}/login.html`)}`;
                
                window.location.href = logoutUrl;
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/login.html';
        }
    }
}

// ==========================================
// 3. ENVIRONMENT VARIABLES SETUP
// ==========================================
/* 
In Netlify Dashboard > Site Settings > Environment Variables:

AUTH0_DOMAIN=dev-j7lkspndihsozye4.eu.auth0.com
AUTH0_CLIENT_ID=a8wqmdKF8OgorCzddR6mFmdSdQCf0vmq
ALLOWED_ORIGIN=https://yourdomain.com
AUTH0_AUDIENCE=your-api-audience (optional)

WICHTIG: Diese Werte als "Contains secret values" markieren!
*/

// ==========================================
// 4. VERWENDUNG IN HTML
// ==========================================
/* 
Ersetze in app/index.html und login.html:

<script type="module">
    // Alte ProtectedApp class entfernen
    // Neue SecureAuthManager verwenden
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SecureAuthManager());
    } else {
        new SecureAuthManager();
    }
</script>
*/