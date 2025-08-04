# Render Environment Variables Setup

Add these environment variables in your Render dashboard:

## Required Variables:
```
DATABASE_URL=your_neon_database_connection_string
PORT=5000
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secure_jwt_secret_for_production
```

## Optional Variables:
```
GITHUB_TOKEN=your_github_personal_access_token
```

## Important Notes:
- Replace placeholder values with your actual credentials
- Change NODE_ENV to "production" 
- Use a strong, unique JWT_SECRET for production
- Keep your API keys secure and don't commit them to git
- Get your actual values from your .env file
