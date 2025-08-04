# 🚀 Render Deployment Guide

## Overview
Render is excellent for full-stack applications with persistent connections, file uploads, and long-running processes. Perfect for your RAG Stack Generator backend.

## 🎯 Recommended: Backend on Render + Frontend on Vercel

### Backend Deployment on Render

#### 1. Prepare for Deployment

Create a Render-specific start script in `package.json`:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node dist/index.js",
    "build": "npm install && npm run build:server",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

#### 2. Create Render Configuration

Create `render.yaml`:
```yaml
services:
  - type: web
    name: ragstackgen-backend
    env: node
    plan: starter
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ragstackgen-db
          property: connectionString
      - key: GROQ_API_KEY
        sync: false
      - key: GITHUB_TOKEN
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-frontend.vercel.app

databases:
  - name: ragstackgen-db
    databaseName: ragstack
    user: ragstack
    plan: starter
```

#### 3. Deploy to Render

1. **Connect GitHub Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `ragstackgen-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (free tier available)

3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:port/db
   GROQ_API_KEY=your_groq_api_key
   GITHUB_TOKEN=your_github_token
   JWT_SECRET=your_secret_key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Database Setup**:
   - Create PostgreSQL database on Render
   - Or use external Neon database
   - Run migrations: `npm run db:push`

## 🌐 Full-Stack Deployment on Render

If you prefer everything on Render:

### 1. Modify Build Process

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### 2. Serve Static Files

Modify `server/index.ts` to serve built frontend:
```typescript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, 'public', 'index.html'));
    }
  });
}
```

### 3. Deploy Configuration

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Static Files**: Automatically served from `dist/public`

## 🗄️ Database Options

### Option 1: Render PostgreSQL
- **Pros**: Integrated, automatic backups
- **Cons**: Limited free tier
- **Setup**: Create database service in Render

### Option 2: Neon (Recommended)
- **Pros**: Generous free tier, serverless
- **Cons**: External dependency
- **Setup**: Use existing Neon database URL

### Option 3: Supabase
- **Pros**: Additional features (auth, storage)
- **Cons**: More complex setup
- **Setup**: Migrate to Supabase PostgreSQL

## 🔧 Environment Variables

### Required Variables:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# AI Services
GROQ_API_KEY=gsk_your_groq_api_key
OPENAI_API_KEY=sk-your_openai_key  # If using OpenAI embeddings

# GitHub Integration
GITHUB_TOKEN=ghp_your_github_token

# Security
JWT_SECRET=your_super_secure_jwt_secret

# App Configuration
NODE_ENV=production
FRONTEND_URL=https://your-domain.onrender.com
```

## 🚀 Deployment Steps

1. **Push to GitHub**: Ensure your code is on GitHub
2. **Create Render Account**: Sign up at render.com
3. **Connect Repository**: Link your GitHub repo
4. **Configure Service**: Set build/start commands
5. **Add Environment Variables**: Set all required env vars
6. **Deploy**: Render will automatically build and deploy

## 🔍 Monitoring & Logs

- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage tracking
- **Health Checks**: Automatic endpoint monitoring
- **Scaling**: Easy horizontal scaling options

## 💰 Cost Considerations

### Free Tier Limits:
- 750 hours/month (enough for 1 service)
- 512MB RAM
- Spins down after inactivity
- No custom domains on free tier

### Paid Plans:
- $7/month for Starter plan
- Always-on services
- More RAM and CPU
- Custom domains
- Priority support

## 🎯 Recommended Architecture

```
Internet
    │
    ▼
┌─────────────┐     API Calls     ┌─────────────┐
│   Vercel    │ ─────────────────► │   Render    │
│ (Frontend)  │                    │ (Backend)   │
│ React App   │                    │ Express API │
│ Static CDN  │                    │ + Database  │
└─────────────┘                    └─────────────┘
```

This gives you:
- ✅ Fast global frontend delivery
- ✅ Reliable backend with persistent connections
- ✅ Cost-effective scaling
- ✅ Easy maintenance and updates
