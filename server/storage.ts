import {
  users,
  notes,
  githubRepos,
  placementQuestions,
  chatSessions,
  type User,
  type InsertUser,
  type Note,
  type InsertNote,
  type GithubRepo,
  type InsertGithubRepo,
  type PlacementQuestion,
  type InsertPlacementQuestion,
  type ChatSession,
  type InsertChatSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Notes operations
  createNote(note: InsertNote): Promise<Note>;
  getNoteById(id: string): Promise<Note | undefined>;
  getNotesByUser(userId: string): Promise<Note[]>;
  getNotesBySubject(userId: string, subject: string): Promise<Note[]>;
  searchNotes(userId: string, query: string): Promise<Note[]>;
  updateNoteEmbedding(id: string, embedding: string): Promise<void>;
  deleteNote(id: string): Promise<void>;

  // GitHub operations
  createGithubRepo(repo: InsertGithubRepo): Promise<GithubRepo>;
  getGithubReposByUser(userId: string): Promise<GithubRepo[]>;
  updateGithubRepoAnalysis(id: string, analysis: any): Promise<void>;

  // Placement questions operations
  createPlacementQuestion(question: InsertPlacementQuestion): Promise<PlacementQuestion>;
  getPlacementQuestionsByUser(userId: string): Promise<PlacementQuestion[]>;
  searchPlacementQuestions(userId: string, filters: { company?: string; year?: number; difficulty?: string; topic?: string }): Promise<PlacementQuestion[]>;
  updateQuestionEmbedding(id: string, embedding: string): Promise<void>;

  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  updateChatSession(id: string, messages: any[]): Promise<ChatSession | undefined>;
  deleteChatSessionsByUser(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async getNotesByUser(userId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.uploadedAt));
  }

  async getNotesBySubject(userId: string, subject: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.subject, subject)))
      .orderBy(desc(notes.uploadedAt));
  }

  async searchNotes(userId: string, query: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(and(
        eq(notes.userId, userId),
        or(
          like(notes.title, `%${query}%`),
          like(notes.content, `%${query}%`)
        )
      ))
      .orderBy(desc(notes.uploadedAt));
  }

  async updateNoteEmbedding(id: string, embedding: string): Promise<void> {
    await db.update(notes).set({ embedding }).where(eq(notes.id, id));
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async createGithubRepo(insertRepo: InsertGithubRepo): Promise<GithubRepo> {
    const [repo] = await db.insert(githubRepos).values(insertRepo).returning();
    return repo;
  }

  async getGithubReposByUser(userId: string): Promise<GithubRepo[]> {
    return await db.select().from(githubRepos).where(eq(githubRepos.userId, userId)).orderBy(desc(githubRepos.createdAt));
  }

  async updateGithubRepoAnalysis(id: string, analysis: any): Promise<void> {
    await db.update(githubRepos).set({ analysis, lastAnalyzed: new Date() }).where(eq(githubRepos.id, id));
  }

  async createPlacementQuestion(insertQuestion: InsertPlacementQuestion): Promise<PlacementQuestion> {
    const [question] = await db.insert(placementQuestions).values(insertQuestion).returning();
    return question;
  }

  async getPlacementQuestionsByUser(userId: string): Promise<PlacementQuestion[]> {
    return await db.select().from(placementQuestions).where(eq(placementQuestions.userId, userId)).orderBy(desc(placementQuestions.createdAt));
  }

  async searchPlacementQuestions(userId: string, filters: { company?: string; year?: number; difficulty?: string; topic?: string }): Promise<PlacementQuestion[]> {
    const conditions = [eq(placementQuestions.userId, userId)];
    
    if (filters.company) {
      conditions.push(eq(placementQuestions.company, filters.company));
    }
    if (filters.year) {
      conditions.push(eq(placementQuestions.year, filters.year));
    }
    if (filters.difficulty) {
      conditions.push(eq(placementQuestions.difficulty, filters.difficulty));
    }
    if (filters.topic) {
      conditions.push(like(placementQuestions.topic, `%${filters.topic}%`));
    }

    return await db.select().from(placementQuestions)
      .where(and(...conditions))
      .orderBy(desc(placementQuestions.createdAt));
  }

  async updateQuestionEmbedding(id: string, embedding: string): Promise<void> {
    await db.update(placementQuestions).set({ embedding }).where(eq(placementQuestions.id, id));
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db.insert(chatSessions).values(insertSession).returning();
    return session;
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.updatedAt));
  }

  async updateChatSession(id: string, messages: any[]): Promise<ChatSession | undefined> {
    const [session] = await db.update(chatSessions)
      .set({ messages, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteChatSessionsByUser(userId: string): Promise<void> {
    await db.delete(chatSessions).where(eq(chatSessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
