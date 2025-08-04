#!/bin/bash

echo "🚀 RAG Stack Generator - Quick Deployment Script"
echo "================================================="

# Test local build first
echo "📦 Testing local build..."
npm run build:server
if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"

echo ""
echo "🎯 Ready for deployment! Here are your options:"
echo ""
echo "1️⃣  RENDER BACKEND DEPLOYMENT:"
echo "   - Go to: https://render.com"
echo "   - Create new Web Service"
echo "   - Connect repository: Amarnathss/RAGStackGen"
echo "   - Build command: npm run build:server"
echo "   - Start command: npm start"
echo ""
echo "2️⃣  VERCEL FRONTEND DEPLOYMENT:"
echo "   - Run: npm run build:frontend"
echo "   - Run: cd client && vercel --prod"
echo ""
echo "🔑 Environment Variables for Render:"
echo "   NODE_ENV=production"
echo "   DATABASE_URL=your_neon_database_url"
echo "   GROQ_API_KEY=your_groq_api_key"
echo "   GITHUB_TOKEN=your_github_token"
echo "   JWT_SECRET=your_jwt_secret"
echo "   FRONTEND_URL=https://your-vercel-app.vercel.app"
echo ""
echo "🔑 Environment Variables for Vercel:"
echo "   VITE_API_URL=https://your-render-backend.onrender.com"
echo ""
echo "✅ All fixes applied - builds should work now!"
