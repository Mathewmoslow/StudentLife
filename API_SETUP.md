# AI-Powered Import Setup

## How It Works

The StudentLife app now features AI-powered task extraction that can understand complex academic schedules, syllabi, and assignment lists.

### Two Parsing Modes:

1. **AI Parsing (Recommended)** - Uses OpenAI GPT-4o to understand context and extract tasks intelligently
2. **Smart Parsing (Fallback)** - Uses pattern matching and natural language date parsing (works offline)

## Setting Up Your OpenAI API Key

### Option 1: Environment Variable (Development)
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart the dev server

### Option 2: In-App Configuration (Easiest)
1. Go to Settings → Import from Text/Syllabus
2. Check "Use AI parsing"
3. Enter your API key in the field
4. The key is saved locally in your browser

### Option 3: Universal Shell API Key
If you mentioned having a "universal shell API key", you can use it directly in the import modal.

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (it starts with `sk-`)

## What the AI Can Parse

The AI understands:
- Complete course syllabi
- Assignment lists from Canvas/Blackboard
- Email announcements
- Informal notes ("Quiz next Friday on chapters 1-3")
- Mixed formats and complex scheduling text
- Relative dates ("next week", "tomorrow", "end of month")

## How the AI Extraction Works

1. **Strict JSON Schema**: The AI is instructed to return only structured JSON with:
   - Task title
   - Type (exam, assignment, project, reading, lab)
   - Due date (parsed to YYYY-MM-DD)
   - Estimated hours
   - Complexity (1-5)
   - Course identifier (if mentioned)

2. **Smart Estimation**: The AI estimates:
   - Reading: 1-2 hours per chapter
   - Assignments: 2-4 hours
   - Exams: 6-10 hours study time
   - Projects: 8-20 hours
   - Labs: 3-5 hours

3. **Fallback**: If AI parsing fails, the smart parser takes over using:
   - Regex patterns
   - Chrono-node for date parsing
   - Keyword detection

## Security Notes

- Your API key is stored only in your browser's localStorage
- It's never sent to any server except OpenAI's API
- The app works without AI (using smart parsing)
- You can disable AI parsing at any time

## Cost Estimation

- GPT-4o costs approximately $0.005 per 1000 input tokens, $0.015 per 1000 output tokens
- Average syllabus parse: ~$0.02-0.03
- Typical usage: < $2/month for regular imports
- Note: GPT-4o is faster and more accurate than GPT-3.5, making it worth the slight cost increase

## Troubleshooting

If AI parsing fails:
1. Check your API key is valid
2. Ensure you have API credits
3. The smart parser will automatically take over
4. You can manually disable AI and use smart parsing