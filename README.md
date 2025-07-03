# FINE TO DINE - Post Generator

> Convert restaurant articles into social media posts using Claude AI

A simple web app that transforms FINE TO DINE magazine articles into formatted Facebook/Instagram posts in under 60 seconds.

## 🎯 What it does

- Paste in a restaurant article
- Get back a formatted social media post
- Includes proper hashtags and call-to-action
- Maintains FINE TO DINE brand voice

## 🛠️ Built with

**Frontend:** Vanilla JavaScript, Modern CSS  
**Backend:** Netlify Functions  
**AI:** Claude 3.5 Sonnet API  
**Auth:** Auth0 + Google OAuth

## 🚀 Quick start

```bash
git clone [repo-url]
cd fine-to-dine-generator
npm install
netlify dev
```

Set these environment variables in Netlify:
```
CLAUDE_API_KEY=your-api-key
AUTH0_DOMAIN=your-domain
AUTH0_CLIENT_ID=your-client-id
```

## 🤖 AI Development

This project was built with AI assistance (Claude 4 Sonnet) for rapid prototyping and development. The code demonstrates modern AI-assisted development practices while maintaining security and professional standards.

## 🔒 Security

- Single-user access (Auth0 rule restricts to specific email)
- No API keys in source code (Netlify environment variables)
- Input sanitization and rate limiting
- Public repo with private secrets

## 📁 Structure

```
├── app/index.html              # Main app
├── login.html                  # Auth page  
├── netlify/functions/          # API endpoints
│   ├── generate.js            # Claude integration
│   └── auth-config.js         # Auth0 config
└── assets/css/                # Modular CSS
```

## 🚀 Deploy

1. Fork this repo
2. Connect to Netlify
3. Set environment variables
4. Configure Auth0 callback URLs
5. Deploy

## License

Private project for FINE TO DINE magazine.

---

**Built with AI assistance for rapid development**