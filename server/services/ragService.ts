import { storage } from '../storage';
import { FileProcessor } from './fileProcessor';
import { GroqService } from './groqService';
import type { Note, PlacementQuestion, GithubRepo } from '@shared/schema';

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
    console.log(`🔍 RAG Search - User: ${userId}, Query: "${query}"`);
    
    try {
      // Create embedding for the query
      const queryEmbedding = await FileProcessor.createEmbedding(query);

      // Search through notes
      const notes = await storage.getNotesByUser(userId);
      const relevantNotes = this.findRelevantNotes(notes, queryEmbedding, query);
      console.log(`📝 Found ${notes.length} total notes, ${relevantNotes.length} relevant`);

      // Search through placement questions
      const questions = await storage.getPlacementQuestionsByUser(userId);
      const relevantQuestions = this.findRelevantQuestions(questions, queryEmbedding, query);
      console.log(`❓ Found ${questions.length} total questions, ${relevantQuestions.length} relevant`);

      // Search through GitHub repositories
      const githubRepos = await storage.getGithubReposByUser(userId);
      const relevantRepos = this.findRelevantRepos(githubRepos, queryEmbedding, query);

      console.log(`🐙 Found ${githubRepos.length} total GitHub repos for user ${userId}`);
      console.log(`🐙 Found ${relevantRepos.length} relevant GitHub repos for query: ${query}`);

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
        })),
        ...relevantRepos.map(repo => {
          console.log(`🐙 Adding GitHub repo to sources: ${repo.repoName}`);
          return {
            type: 'github' as const,
            title: repo.repoName,
            content: this.formatRepoContent(repo),
            relevance: this.calculateRelevance(`${repo.repoName} ${repo.description} ${JSON.stringify(repo.analysis)}`, query)
          };
        })
      ].sort((a, b) => b.relevance - a.relevance).slice(0, 5);

      console.log(`Final sources breakdown:`, sources.map(s => ({ type: s.type, title: s.title, relevance: s.relevance })));

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

  private static findRelevantRepos(repos: GithubRepo[], queryEmbedding: string, query: string): GithubRepo[] {
    const queryLower = query.toLowerCase();
    
    // For debugging - always return some repos if they exist and query mentions projects/files
    const isProjectQuery = queryLower.includes('file') ||
                          queryLower.includes('structure') ||
                          queryLower.includes('project') ||
                          queryLower.includes('repo') ||
                          queryLower.includes('code') ||
                          queryLower.includes('folder') ||
                          queryLower.includes('directory') ||
                          queryLower.includes('architecture') ||
                          queryLower.includes('technology') ||
                          queryLower.includes('stack') ||
                          queryLower.includes('github');
    
    console.log(`🔍 Query "${query}" - isProjectQuery: ${isProjectQuery}, available repos: ${repos.length}`);
    
    const relevantRepos = repos.filter(repo => {
      const repoNameLower = repo.repoName.toLowerCase();
      const descriptionLower = (repo.description || '').toLowerCase();
      const analysisText = repo.analysis ? JSON.stringify(repo.analysis).toLowerCase() : '';
      
      // Check for exact matches first
      const exactMatch = repoNameLower.includes(queryLower) || 
                        descriptionLower.includes(queryLower) ||
                        analysisText.includes(queryLower);
      
      // If it's a project-related query and the repo has analysis, include it
      const shouldInclude = exactMatch || (isProjectQuery && repo.analysis);
      
      console.log(`🔍 Checking repo ${repo.repoName}: exactMatch=${exactMatch}, hasAnalysis=${!!repo.analysis}, shouldInclude=${shouldInclude}`);
      
      return shouldInclude;
    });
    
    // If no repos found but it's a project query, return analyzed repos anyway
    if (relevantRepos.length === 0 && isProjectQuery && repos.length > 0) {
      console.log(`🔍 No exact matches, returning analyzed repos for project query`);
      return repos.filter(repo => repo.analysis).slice(0, 3);
    }
    
    return relevantRepos.slice(0, 3);
  }

  private static formatRepoContent(repo: GithubRepo): string {
    let content = `Repository: ${repo.repoName}\n`;
    
    if (repo.description) {
      content += `Description: ${repo.description}\n`;
    }
    
    if (repo.language) {
      content += `Primary Language: ${repo.language}\n`;
    }
    
    if (repo.stars) {
      content += `Stars: ${repo.stars}\n`;
    }
    
    if (repo.analysis) {
      const analysis = repo.analysis as any;
      if (analysis.summary) {
        content += `\nSummary: ${analysis.summary}\n`;
      }
      if (analysis.technologies && Array.isArray(analysis.technologies)) {
        content += `Technologies: ${analysis.technologies.join(', ')}\n`;
      }
      if (analysis.architecture) {
        content += `Architecture: ${analysis.architecture}\n`;
      }
      if (analysis.keyFiles && Array.isArray(analysis.keyFiles)) {
        content += `\nKey Files:\n`;
        analysis.keyFiles.slice(0, 3).forEach((file: any) => {
          content += `- ${file.name}: ${file.purpose || 'No description'}\n`;
        });
      }
    }
    
    return content;
  }
}
