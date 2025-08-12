# Deployment Guide

## Local Development

### 1. Create a `.env` file in the project root:
```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

This file is gitignored and won't be committed to your repository.

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Deploy the project**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Add Environment Variable in Vercel Dashboard**:
   - Go to your project on [vercel.com](https://vercel.com)
   - Navigate to Settings → Environment Variables
   - Add a new variable:
     - Name: `VITE_OPENAI_API_KEY`
     - Value: `sk-your-actual-api-key-here`
     - Environment: ✓ Production, ✓ Preview, ✓ Development

3. **Redeploy** to apply the environment variable:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel CLI

Set the environment variable directly via CLI:
```bash
vercel env add VITE_OPENAI_API_KEY
```
Then enter your API key when prompted.

## Netlify Deployment

1. **Deploy to Netlify**:
   ```bash
   npm run build
   # Drag and drop the 'dist' folder to Netlify
   ```

2. **Add Environment Variable**:
   - Go to Site Settings → Environment Variables
   - Add:
     - Key: `VITE_OPENAI_API_KEY`
     - Value: `sk-your-actual-api-key-here`

3. **Trigger a redeploy** from the Deploys tab

## Vite + Other Platforms

For any platform that supports environment variables:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variable**: `VITE_OPENAI_API_KEY=sk-your-key`

## Important Notes

### Security
- **NEVER commit your `.env` file** to Git
- The API key is only used client-side to call OpenAI directly
- No backend proxy is needed (direct browser → OpenAI communication)

### Vite Environment Variables
- Must be prefixed with `VITE_` to be exposed to the client
- Accessed via `import.meta.env.VITE_OPENAI_API_KEY`
- Replaced at build time (not runtime)

### Testing Your Deployment
1. Open the deployed app
2. Go to Settings → Import from Text/Syllabus
3. If configured correctly, you'll see: "✓ API key configured via environment"
4. Test with sample text:
   ```
   Math homework due next Friday
   Biology exam on December 15th
   Read chapters 1-3 by Monday
   ```

## Fallback Options

If you don't want to use environment variables:

1. **User-Provided Keys**: Users can enter their own API key in the import modal
2. **Smart Parser Only**: Uncheck "Use AI parsing" to use the offline parser
3. **Backend Proxy**: Set up your own backend to proxy OpenAI requests (more complex)

## Cost Management

- GPT-4o charges ~$0.005 per 1,000 input tokens, $0.015 per 1,000 output tokens
- Average syllabus parse: ~$0.02-0.03
- Set usage limits in your OpenAI dashboard: https://platform.openai.com/account/limits

## Troubleshooting

### "API key not configured"
- Check that `VITE_OPENAI_API_KEY` is set in your deployment platform
- Ensure you've redeployed after adding the environment variable

### "Invalid API key"
- Verify your key starts with `sk-`
- Check it's not expired on OpenAI's dashboard
- Ensure you have API credits

### Works locally but not in production
- Environment variables must be set in the deployment platform
- Rebuild and redeploy after adding variables
- Check the browser console for specific errors