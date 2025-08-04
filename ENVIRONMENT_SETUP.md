# Environment Variables for Deployment

## Render Backend Environment Variables
Set these in your Render service dashboard:

```
DATABASE_URL=<your_neon_database_connection_string>
GROQ_API_KEY=<your_groq_api_key>
JWT_SECRET=<your_secure_jwt_secret>
GITHUB_TOKEN=<your_github_personal_access_token>
NODE_ENV=production
PORT=10000
```

## Vercel Frontend Environment Variables
Set these in your Vercel project dashboard:

```
VITE_API_URL=https://ragstackgen.onrender.com
```

## Where to Get the API Keys
- **DATABASE_URL**: From your Neon dashboard (Database -> Connection String)
- **GROQ_API_KEY**: From https://console.groq.com/keys
- **GITHUB_TOKEN**: From GitHub Settings -> Developer settings -> Personal access tokens
- **JWT_SECRET**: Generate a secure random string (32+ characters)

## Deployment URLs
- **Frontend (Vercel)**: https://ragstackgen.vercel.app
- **Backend (Render)**: https://ragstackgen.onrender.com

## Testing the Deployment
1. Wait for both deployments to complete
2. Visit the frontend URL
3. Try registering/logging in
4. Test file upload and chat functionality
5. Check the browser console for any API errors

## Troubleshooting
- If you see CORS errors, make sure the backend environment variables are set correctly
- If the frontend shows a blank page, check that VITE_API_URL is set in Vercel
- Check the Render logs for any runtime errors
- Make sure the database connection string is working
- **Build Issues**: If Render build fails, check that all dependencies are properly externalized
- **Runtime Issues**: Ensure all environment variables are set in the Render dashboard
- **Frontend Loading Issues**: Verify VITE_API_URL points to your Render service URL

## Latest Deployment Status
- ✅ **Build Configuration**: Server packages are properly externalized for Render
- ✅ **Package Dependencies**: All necessary packages included in Render package.json
- ✅ **CORS Configuration**: Backend configured to accept requests from Vercel
- ✅ **Environment Variables**: Template ready for manual configuration
- ✅ **Dependency Resolution**: All external packages (Vite plugins, Octokit, drizzle-zod, ws, openai) properly handled
- ✅ **Bundle Optimization**: Server bundle optimized to **62.9kb** for ultra-fast deployment
- ✅ **Groq API Integration**: OpenAI package properly externalized for Groq service compatibility

## Manual Setup Steps

### For Render:
1. Go to your Render dashboard
2. Select your RAGStackGen service
3. Go to Environment tab
4. Add each environment variable listed above with your actual values

### For Vercel:
1. Go to your Vercel dashboard
2. Select your RAGStackGen project
3. Go to Settings -> Environment Variables
4. Add VITE_API_URL with the value: https://ragstackgen.onrender.com
