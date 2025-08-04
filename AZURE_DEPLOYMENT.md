# RAG Stack Generator - Azure Deployment

## 🚀 Quick Azure Deployment Guide

### Prerequisites
- Azure account with App Service capability
- Node.js 18+ runtime
- PostgreSQL database (recommend Neon or Azure Database for PostgreSQL)

### Environment Variables Required
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-app-name.azurewebsites.net
```

### Deployment Steps

1. **Upload Files**: Upload the entire project folder to Azure App Service
2. **Set Environment Variables**: Configure all required environment variables in Azure App Service settings
3. **Database Setup**: Ensure your PostgreSQL database is accessible and run migrations if needed
4. **Start Application**: Azure will automatically run `npm start` which executes `node dist/index.js`

### Project Structure
```
dist/
├── index.js          # Compiled Node.js server
├── package.json      # Production dependencies
└── public/           # Built React frontend
    ├── index.html
    └── assets/
        ├── index-*.css
        └── index-*.js
```

### Features
- ✅ **RAG System**: Context-aware AI assistant with Groq integration
- ✅ **GitHub Integration**: Automatic repository analysis and code understanding
- ✅ **Notes Management**: Upload and search through study materials
- ✅ **Placement Prep**: Interview questions and preparation tools
- ✅ **Real-time Chat**: Interactive AI study assistant
- ✅ **JWT Authentication**: Secure user sessions
- ✅ **PostgreSQL Database**: Scalable data storage with Drizzle ORM

### Production Ready
- Built with Vite for optimized frontend bundle
- Compiled Node.js server with esbuild
- Proper error handling and logging
- Environment-based configuration
- CORS and security middleware configured

### Support
This application is ready for Azure App Service deployment with proper routing for both API endpoints and SPA navigation.
