# Personal Placement Assistant

## Overview

This is a Personal Placement Assistant (PPA) - an AI-powered study dashboard that combines React frontend with Express backend to help students manage their placement preparation. The application features a RAG (Retrieval-Augmented Generation) pipeline that allows users to upload study notes, connect GitHub repositories, and query placement questions using natural language processing. The system uses Grok AI for intelligent responses and provides a comprehensive study management platform with JWT authentication for secure access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: JWT token-based authentication with local storage persistence

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT with bcrypt for password hashing
- **File Processing**: Custom service for handling PDF, DOCX, Markdown, and text files
- **AI Integration**: Grok API integration for RAG responses
- **File Uploads**: Multer middleware for multipart form handling

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Authentication and profile information with optional GitHub tokens
- **Notes**: Study materials with vector embeddings for semantic search
- **GitHub Repos**: Repository metadata with analysis results stored as JSONB
- **Placement Questions**: Company-wise questions with difficulty ratings and embeddings
- **Chat Sessions**: Conversation history with AI assistant

### Core Services Architecture
- **File Processor**: Handles multiple file formats (PDF, DOCX, MD, TXT) and extracts text content
- **RAG Service**: Implements semantic search across notes and questions using vector embeddings
- **GitHub Service**: Integrates with GitHub API for private repository access and code analysis
- **Grok Service**: Manages AI interactions using X.ai's Grok model for contextual responses

### Authentication & Security
- JWT-based authentication with protected API routes
- Middleware-based token validation
- Secure password hashing with bcrypt
- Personal access token storage for GitHub integration

### File Upload & Processing Pipeline
- Multer-based file upload handling
- Multi-format document processing (PDF, DOCX, Markdown, plain text)
- Automatic content extraction and indexing
- Vector embedding generation for semantic search capabilities

## External Dependencies

### Cloud Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Replit**: Development and deployment platform with integrated tooling

### AI & Language Models
- **Groq**: Primary LLM for generating contextual responses in RAG pipeline using llama3-8b-8192 model
- **Vector Embeddings**: Text-to-vector conversion for semantic search (implementation pending)

### Third-Party APIs
- **GitHub API**: Private repository access via Octokit for code analysis and retrieval
- **PDF Processing**: pdf.js library for PDF text extraction
- **Document Processing**: Mammoth library for DOCX file parsing

### UI & Design System
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Backend bundling for production deployment

### Runtime Dependencies
- **Express Middleware**: CORS, body parsing, and request logging
- **WebSocket Support**: For Neon database connections
- **Form Handling**: React Hook Form with Zod validation schemas