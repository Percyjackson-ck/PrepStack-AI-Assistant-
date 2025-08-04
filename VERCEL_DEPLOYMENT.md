# 🚀 Vercel Deployment Guide

## Overview
Vercel is perfect for deploying the frontend as a static site with serverless API functions. However, due to the complexity of your RAG system, I recommend using Vercel primarily for frontend hosting and a separate service like Render for the backend.

## Option 1: Frontend Only on Vercel (Recommended)

### 1. Prepare Frontend-Only Build

Create a separate build configuration for frontend-only deployment:

```bash
# Build frontend only
npm run build:frontend
```

Add this script to your `package.json`:
```json
{
  "scripts": {
    "build:frontend": "vite build --outDir dist/vercel-frontend"
  }
}
```

### 2. Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd client
   vercel --prod
   ```

### 3. Environment Variables

Set these in Vercel dashboard:
```
VITE_API_URL=https://your-backend-on-render.com
```

### 4. Vercel Configuration

Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/src/**",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "../dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Option 2: Full-Stack on Vercel (Advanced)

⚠️ **Note**: This is complex due to file uploads, database connections, and long-running AI processes.

### Limitations on Vercel:
- 10-second timeout for serverless functions
- Limited file system access
- Cold starts may affect AI response times
- File uploads need special handling

### If you still want to try:

1. **Convert Express routes to Vercel API routes**:
   - Move each route to `api/` folder
   - Handle file uploads with temporary storage
   - Use connection pooling for database

2. **Example API route** (`api/chat.js`):
   ```javascript
   export default async function handler(req, res) {
     // Your chat logic here
     // Must complete within 10 seconds
   }
   ```

## Recommended Architecture

🎯 **Best Practice**: Use Vercel for frontend + Render for backend

```
┌─────────────┐    API calls    ┌─────────────┐
│   Vercel    │ ──────────────► │   Render    │
│ (Frontend)  │                 │ (Backend)   │
│  React SPA  │                 │ Express API │
└─────────────┘                 └─────────────┘
```

## Benefits of This Setup:
- ✅ Fast global CDN for frontend (Vercel)
- ✅ Reliable backend with persistent connections (Render)
- ✅ No serverless timeout issues
- ✅ Proper file upload handling
- ✅ Database connection pooling
- ✅ Cost-effective

## Next Steps:
1. Deploy frontend to Vercel
2. Deploy backend to Render (see RENDER_DEPLOYMENT.md)
3. Update frontend API URLs to point to Render backend
