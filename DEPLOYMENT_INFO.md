# StudentLife Deployment Information

## Current Deployment Setup

### GitHub Pages (Current)
- **URL**: https://mathewmoslow.github.io/StudentLife/
- **Type**: Static hosting
- **Deployment**: Via GitHub Actions on push to main branch
- **Base Path**: `/StudentLife/` (configured in vite.config.ts and Router)
- **Environment Variables**: NOT SUPPORTED (static hosting only)

### API Key Handling
Since GitHub Pages is static hosting, it cannot securely store environment variables. The OpenAI API key is handled in two ways:

1. **Local Storage** (Current): Users enter their own API key, stored in browser
2. **Environment Variable** (Development only): Set `VITE_OPENAI_API_KEY` locally

## Testing Features

### View Welcome Screen
Add `?welcome=true` to any URL to force show the welcome screen:
- Production: https://mathewmoslow.github.io/StudentLife/?welcome=true
- Local: http://localhost:5173/?welcome=true

### Clear Local Data
To reset and see first-time user experience:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Clear all items for the site
4. Refresh the page

## Alternative Deployment Options

### Option 1: Vercel (Recommended for full features)
```bash
npm install -g vercel
vercel
```
Benefits:
- Environment variable support for API keys
- Serverless functions for secure API calls
- Better performance
- Custom domain support

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```
Benefits:
- Environment variable support
- Form handling
- Serverless functions

### Option 3: Self-hosted with Node.js
Create a backend server to:
- Proxy OpenAI API calls
- Store API keys securely
- Handle authentication

## Build and Deploy Commands

### Local Development
```bash
npm run dev
# Visit http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output in dist/ folder
```

### Preview Production Build
```bash
npm run preview
```

## Important Notes

1. **API Keys on GitHub Pages**: Users must provide their own OpenAI API key since GitHub Pages cannot store secrets
2. **Routing**: All routes use hash-based routing for GitHub Pages compatibility
3. **Base Path**: The app is served from `/StudentLife/` subdirectory, not root
4. **CORS**: Some features may be limited due to CORS restrictions on static hosting

## Recommended Setup for Full Features

For a production app with all features:
1. Deploy to Vercel or Netlify
2. Set up environment variables for API keys
3. Create serverless functions for API calls
4. Remove the need for users to enter API keys