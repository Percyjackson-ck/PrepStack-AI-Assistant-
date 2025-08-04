import { storage } from '../storage';
import { FileProcessor } from './fileProcessor';
import { GroqService } from './groqService';
import type { Note, PlacementQuestion } from '@shared/schema';

export interface RAGResponse {
  answer: string;
  sources: Array<{
    type: 'note' | 'question' | 'github';
    title: string;
    content: string;
    relevance: number;
  }>;
}

export class RAGService {
  private static groqService = new GroqService();

  static async searchAndAnswer(userId: string, query: string): Promise<RAGResponse> {
    try {
      // Create embedding for the query
      const queryEmbedding = await FileProcessor.createEmbedding(query);

      // Search through notes
      const notes = await storage.getNotesByUser(userId);
      const relevantNotes = this.findRelevantNotes(notes, queryEmbedding, query);

      // Search through placement questions
      const questions = await storage.getPlacementQuestionsByUser(userId);
      const relevantQuestions = this.findRelevantQuestions(questions, queryEmbedding, query);

      // Combine all sources
      const sources = [
        ...relevantNotes.map(note => ({
          type: 'note' as const,
          title: note.title,
          content: note.content.substring(0, 500) + (note.content.length > 500 ? '...' : ''),
          relevance: this.calculateRelevance(note.content, query)
        })),
        ...relevantQuestions.map(question => ({
          type: 'question' as const,
          title: `${question.company} - ${question.topic}`,
          content: question.question,
          relevance: this.calculateRelevance(question.question, query)
        }))
      ].sort((a, b) => b.relevance - a.relevance).slice(0, 5);

      // Generate answer using Grok
      const context = sources.map(source => 
        `[${source.type.toUpperCase()}] ${source.title}:\n${source.content}`
      ).join('\n\n');

      const answer = await this.groqService.generateAnswer(query, context);

      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('RAG Service error:', error);
      throw new Error('Failed to generate answer');
    }
  }

  private static findRelevantNotes(notes: Note[], queryEmbedding: string, query: string): Note[] {
    return notes
      .filter(note => {
        // Simple text matching as fallback
        const queryLower = query.toLowerCase();
        const contentLower = note.content.toLowerCase();
        const titleLower = note.title.toLowerCase();
        
        return contentLower.includes(queryLower) || titleLower.includes(queryLower) ||
               this.calculateTextSimilarity(note.embedding || '', queryEmbedding) > 0.3;
      })
      .slice(0, 3);
  }

  private static findRelevantQuestions(questions: PlacementQuestion[], queryEmbedding: string, query: string): PlacementQuestion[] {
    return questions
      .filter(question => {
        const queryLower = query.toLowerCase();
        const questionLower = question.question.toLowerCase();
        const topicLower = question.topic.toLowerCase();
        
        return questionLower.includes(queryLower) || topicLower.includes(queryLower) ||
               this.calculateTextSimilarity(question.embedding || '', queryEmbedding) > 0.3;
      })
      .slice(0, 2);
  }

  private static calculateTextSimilarity(embedding1: string, embedding2: string): number {
    if (!embedding1 || !embedding2) return 0;
    return FileProcessor.calculateSimilarity(embedding1, embedding2);
  }

  private static calculateRelevance(content: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        matches++;
      }
    });
    
    return matches / queryWords.length;
  }
}
