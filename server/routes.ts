import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertNoteSchema, insertPlacementQuestionSchema, insertChatSessionSchema, type User } from "@shared/schema";
import { FileProcessor } from "./services/fileProcessor";
import { RAGService } from "./services/ragService";
import { GitHubService } from "./services/githubService";
import { GrokService } from "./services/grokService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const upload = multer({ dest: 'uploads/' });

// Auth middleware
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ email, password: hashedPassword, name });
      
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Notes routes
  app.post("/api/notes/upload", authenticateToken, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { subject } = req.body;
      const userId = req.user.userId;

      const processedFile = await FileProcessor.processFile(req.file.path, req.file.originalname);
      const embedding = await FileProcessor.createEmbedding(processedFile.content);

      const note = await storage.createNote({
        userId,
        title: processedFile.title,
        content: processedFile.content,
        subject: subject || "General",
        fileType: processedFile.fileType,
        fileName: req.file.originalname
      });

      await storage.updateNoteEmbedding(note.id, embedding);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({ message: "File uploaded successfully", note });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  app.get("/api/notes", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { subject } = req.query;

      const notes = subject 
        ? await storage.getNotesBySubject(userId, subject as string)
        : await storage.getNotesByUser(userId);

      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/search", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ message: "Query parameter required" });
      }

      const notes = await storage.searchNotes(userId, q as string);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // GitHub routes
  app.post("/api/github/connect", authenticateToken, async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.userId;

      // Update user with GitHub token
      await storage.updateUser(userId, { githubToken: token });

      // Fetch repositories
      const githubService = new GitHubService(token);
      const repos = await githubService.fetchUserRepositories(userId, token);

      res.json({ message: "GitHub connected successfully", repos });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect GitHub" });
    }
  });

  app.get("/api/github/repos", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const repos = await storage.getGithubReposByUser(userId);
      res.json(repos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.post("/api/github/analyze/:repoId", authenticateToken, async (req, res) => {
    try {
      const { repoId } = req.params;
      const userId = req.user.userId;

      const user = await storage.getUser(userId);
      if (!user?.githubToken) {
        return res.status(400).json({ message: "GitHub token not configured" });
      }

      const repos = await storage.getGithubReposByUser(userId);
      const repo = repos.find(r => r.id === repoId);
      
      if (!repo) {
        return res.status(404).json({ message: "Repository not found" });
      }

      const githubService = new GitHubService(user.githubToken);
      const analysis = await githubService.analyzeRepository(userId, repoId, repo.repoName);

      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze repository" });
    }
  });

  // Placement questions routes
  app.post("/api/placement/questions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const questionData = insertPlacementQuestionSchema.parse({ ...req.body, userId });

      const question = await storage.createPlacementQuestion(questionData);
      const embedding = await FileProcessor.createEmbedding(question.question);
      await storage.updateQuestionEmbedding(question.id, embedding);

      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Failed to create question" });
    }
  });

  app.get("/api/placement/questions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { company, year, difficulty, topic } = req.query;

      const filters: any = {};
      if (company) filters.company = company as string;
      if (year) filters.year = parseInt(year as string);
      if (difficulty) filters.difficulty = difficulty as string;
      if (topic) filters.topic = topic as string;

      const questions = await storage.searchPlacementQuestions(userId, filters);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Chat routes
  app.post("/api/chat/sessions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { title, messages } = req.body;

      const session = await storage.createChatSession({
        userId,
        title: title || "New Chat",
        messages: messages || []
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const sessions = await storage.getChatSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/:sessionId/message", authenticateToken, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      const userId = req.user.userId;

      const sessions = await storage.getChatSessionsByUser(userId);
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      const messages = [...(session.messages as any[]), { role: 'user', content: message }];

      // Generate RAG response
      const ragResponse = await RAGService.searchAndAnswer(userId, message);
      
      const assistantMessage = { role: 'assistant', content: ragResponse.answer, sources: ragResponse.sources };
      messages.push(assistantMessage);

      await storage.updateChatSession(sessionId, messages);

      res.json({ message: assistantMessage });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // RAG search endpoint
  app.post("/api/search", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const response = await RAGService.searchAndAnswer(userId, query);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const [notes, repos, questions, sessions] = await Promise.all([
        storage.getNotesByUser(userId),
        storage.getGithubReposByUser(userId),
        storage.getPlacementQuestionsByUser(userId),
        storage.getChatSessionsByUser(userId)
      ]);

      const stats = {
        totalNotes: notes.length,
        totalRepos: repos.length,
        totalQuestions: questions.length,
        solvedQuestions: questions.filter(q => q.isSolved).length,
        chatSessions: sessions.length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
