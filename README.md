# 🚀 RAG Stack Generator

A comprehensive AI-powered study assistant built with React, Node.js, and advanced RAG (Retrieval-Augmented Generation) capabilities. This application combines note management, GitHub repository analysis, and intelligent AI conversations to create the ultimate learning companion.

## ✨ Features

### 🤖 AI Study Assistant
- **Context-Aware Conversations**: Powered by Groq AI for fast, accurate responses
- **RAG System**: Retrieves relevant information from your notes, GitHub repos, and study materials
- **Real-time Chat**: Interactive conversations with conversation history
- **Source Attribution**: See exactly where AI responses come from

### 📚 Smart Note Management
- **File Upload**: Support for PDF, DOCX, and TXT files
- **Intelligent Search**: Find relevant notes based on context and keywords
- **Automatic Processing**: Extract and index content for AI retrieval

### 🐙 GitHub Integration
- **Repository Analysis**: Automatic analysis of your GitHub repositories
- **Code Understanding**: AI comprehends your project structure and technologies
- **Project Insights**: Get help with your own code and projects

### 🎯 Placement Preparation
- **Interview Questions**: Curated placement questions by company and topic
- **Practice Mode**: Test your knowledge with interactive Q&A
- **Progress Tracking**: Monitor your preparation progress

### 🔐 Security & Authentication
- **JWT Authentication**: Secure user sessions
- **Protected Routes**: Role-based access control
- **Environment-based Configuration**: Secure API key management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **TanStack Query** for efficient data fetching
- **Tailwind CSS** with shadcn/ui components
- **Lucide Icons** for beautiful iconography

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

### Database
- **PostgreSQL** with Neon cloud hosting
- **Drizzle ORM** for type-safe database operations
- **Database migrations** and schema management

### AI & Processing
- **Groq API** for fast AI inference
- **OpenAI Embeddings** for semantic search
- **PDF/DOCX Processing** for document analysis
- **GitHub API** for repository integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (recommend Neon)
- Groq API key
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amarnathss/RAGStackGen.git
   cd RAGStackGen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL=your_neon_postgresql_url
   GROQ_API_KEY=your_groq_api_key
   GITHUB_TOKEN=your_github_token
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5000
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see your application!

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options

#### 🚀 Vercel (Frontend) + Render (Backend) - Recommended
- **Vercel**: Deploy React frontend with global CDN
- **Render**: Deploy Express backend with persistent connections
- See `VERCEL_DEPLOYMENT.md` and `RENDER_DEPLOYMENT.md` for detailed guides

#### 🔧 Render (Full-Stack)
- Deploy entire application on Render
- Integrated database and file storage
- See `RENDER_DEPLOYMENT.md` for configuration

#### ☁️ Azure App Service
- Enterprise-grade deployment
- Pre-configured `web.config` for IIS
- See `AZURE_DEPLOYMENT.md` for detailed instructions

### Quick Deploy Commands

**Vercel (Frontend only):**
```bash
npm run build:frontend
cd client && vercel --prod
```

**Render (Full-stack):**
```bash
# Push to GitHub, then connect repository in Render dashboard
git push origin main
```

## 🏗️ Project Structure

```
RAGStackGen/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/           # Utilities and API client
├── server/                 # Node.js backend
│   ├── services/          # Business logic (RAG, AI, GitHub)
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database operations
├── shared/                # Shared TypeScript types
└── dist/                  # Production build output
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for fast AI inference
- [Neon](https://neon.tech/) for PostgreSQL hosting
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations

---

**Built with ❤️ by [Amarnathss](https://github.com/Amarnathss) and [Girish C K](https://github.com/Percyjackson-ck)**

*Empowering students with AI-driven learning tools*
