# DigitalOcean App Platform Deployment Guide

This guide covers how to deploy the RAG Stack Generator to DigitalOcean App Platform - a full-stack application in a single deployment.

## 🚀 DigitalOcean App Platform Deployment

### Why App Platform?
- ✅ **Easiest deployment** - No server management required
- ✅ **Full-stack in one** - Backend and frontend served together
- ✅ **Automatic HTTPS** - SSL certificates handled automatically  
- ✅ **Auto-scaling** - Scales based on traffic
- ✅ **GitHub integration** - Auto-deploy on push
- ✅ **Built-in monitoring** - Logs and metrics included
- ✅ **Managed infrastructure** - No server maintenance

### Application Architecture
Your RAG Stack Generator is a **unified full-stack application**:
- **Backend**: Express.js API serving `/api/*` routes
- **Frontend**: React app served as static files from the same server
- **Single deployment**: One component handles everything
- **Production mode**: Backend serves pre-built frontend files

### Prerequisites
1. GitHub repository with your code
2. DigitalOcean account
3. Database (Neon PostgreSQL recommended)
4. Required API keys (Groq, GitHub token)

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub with the `.do/app.yaml` configuration file.

### Step 2: Create App on DigitalOcean
1. **Go to App Platform**
   - Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click **"Create App"**

2. **Connect GitHub Repository**
   - Choose **"GitHub"** as source
   - Select your repository: `Amarnathss/RAGStackGen`
   - Choose branch: `main`
   - ✅ **Auto-detect configuration** will find your `.do/app.yaml` file

3. **Review App Configuration**
   - **App Name**: `ragstack-generator` (or your preferred name)
   - **Service Name**: `api` 
   - **Build Command**: `npm run build` (builds both frontend and backend)
   - **Run Command**: `npm start` (serves both API and frontend)
   - **HTTP Port**: `5000`

### Step 3: Configure Environment Variables
Add these environment variables in the App Platform dashboard:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Application port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `GITHUB_TOKEN` | GitHub personal token | `ghp_...` |
| `JWT_SECRET` | Random secret for JWT | `your-random-secret-string` |

### Step 4: Deploy
1. **Review Settings** - Make sure all configuration is correct
2. **Click "Create Resources"** - DigitalOcean will build and deploy your app
3. **Wait for Build** - First deployment takes 5-10 minutes
4. **Get Your URL** - You'll receive a URL like `https://ragstack-generator-xxxxx.ondigitalocean.app`
5. **Access Your App** - Both frontend and API are served from the same URL:
   - **Frontend**: `https://your-app.ondigitalocean.app` (React app)
   - **API**: `https://your-app.ondigitalocean.app/api/*` (Backend routes)

---

## 🔧 Environment Variables Setup Guide

### Database URL (Neon PostgreSQL)
1. **Create Neon Account**: Go to [Neon](https://neon.tech)
2. **Create Database**: Create new project and database
3. **Get Connection String**: Copy the connection URL
4. **Format**: `postgresql://username:password@host:5432/database`

### Groq API Key
1. **Create Account**: Go to [Groq](https://groq.com)
2. **Generate API Key**: In dashboard, create new API key
3. **Format**: `gsk_...`

### GitHub Token
1. **Go to GitHub Settings**: Settings → Developer settings → Personal access tokens
2. **Generate Token**: Create token with `repo` scope
3. **Format**: `ghp_...`

### JWT Secret
1. **Generate Random String**: Use any password generator
2. **Minimum Length**: 32 characters recommended
3. **Keep Secure**: Never commit to repository

---

## 📊 Monitoring and Management

### App Platform Dashboard
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory, and request metrics
- **Deployments**: Track deployment history
- **Settings**: Update environment variables and scaling

### Health Monitoring
Your app includes a health check endpoint at `/api/health` that App Platform uses to monitor your application.

### Auto-Deployment
- **Automatic**: Pushes to `main` branch trigger auto-deployment
- **Manual**: Can also trigger deployments manually from dashboard

---

## 💰 Cost Estimation

| Resource | Monthly Cost (USD) |
|----------|-------------------|
| **Basic App** (512MB RAM, 1 vCPU) | ~$12 |
| **Professional App** (1GB RAM, 1 vCPU) | ~$24 |
| **Database** (Neon Free Tier) | $0 |
| **Database** (Neon Pro) | $19+ |

**Total estimated cost**: $12-43/month depending on your needs.

---

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
**Symptoms**: App fails to build
**Solutions**:
- Check build logs in App Platform dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed
- Test build locally: `npm run build`

#### Environment Variable Issues
**Symptoms**: App starts but features don't work
**Solutions**:
- Verify all environment variables are set correctly
- Check variable names match exactly (case-sensitive)
- Ensure secrets don't have extra spaces or quotes
- Test database connection string format

#### Database Connection Errors
**Symptoms**: "Database connection failed" errors
**Solutions**:
- Verify `DATABASE_URL` format is correct
- Check database allows connections from DigitalOcean IPs
- Ensure database is running and accessible
- Test connection string locally

#### Port Issues
**Symptoms**: "Application failed to start" 
**Solutions**:
- Ensure `PORT` environment variable is set to `5000`
- Verify app listens on `0.0.0.0` (already configured)
- Check no other process is using the port

### Getting Help
- **DigitalOcean Docs**: [App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- **Community**: DigitalOcean Community Forums
- **Support**: DigitalOcean Support (for paid accounts)

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Add your custom domain in App Platform dashboard
   - Update DNS records to point to DigitalOcean
   - SSL certificate will be automatically provisioned

2. **Scaling** 
   - Monitor usage in dashboard
   - Upgrade plan if needed for more resources
   - Configure auto-scaling rules

3. **Backups**
   - Set up database backups (Neon handles this automatically)
   - Consider backing up uploaded files if using file storage

4. **Updates**
   - Push code changes to GitHub
   - App Platform will automatically rebuild and deploy
   - Monitor deployments in dashboard

---

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] `.do/app.yaml` configuration file present
- [ ] Neon database created and connection string obtained
- [ ] Groq API key generated
- [ ] GitHub personal access token created
- [ ] JWT secret generated
- [ ] App created on DigitalOcean App Platform
- [ ] Environment variables configured
- [ ] Full-stack app successfully deployed and accessible
- [ ] Both frontend and API working from same URL

**🎉 Congratulations! Your full-stack RAG Stack Generator is now live on DigitalOcean App Platform!**
