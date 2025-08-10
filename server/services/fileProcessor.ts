import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProcessedFile {
  content: string;
  title: string;
  fileType: string;
}

export class FileProcessor {
  static async processFile(filePath: string, originalName: string): Promise<ProcessedFile> {
    const extension = path.extname(originalName).toLowerCase();
    const title = path.basename(originalName, extension);

    switch (extension) {
      case '.pdf':
        return await this.processPDF(filePath, title);
      case '.docx':
        return await this.processDocx(filePath, title);
      case '.md':
        return await this.processMarkdown(filePath, title);
      case '.txt':
        return await this.processText(filePath, title);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private static async processPDF(filePath: string, title: string): Promise<ProcessedFile> {
    // TODO: Implement real PDF parsing using pdf-parse or similar lib
    const content = `PDF file: ${title}\n\n[PDF parsing not implemented yet]`;
    return { content, title, fileType: 'pdf' };
  }

  private static async processDocx(filePath: string, title: string): Promise<ProcessedFile> {
    // TODO: Implement real DOCX parsing using mammoth or similar lib
    const content = `DOCX file: ${title}\n\n[DOCX parsing not implemented yet]`;
    return { content, title, fileType: 'docx' };
  }

  private static async processMarkdown(filePath: string, title: string): Promise<ProcessedFile> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content: content.trim(), title, fileType: 'markdown' };
    } catch (error) {
      throw new Error(`Failed to process Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async processText(filePath: string, title: string): Promise<ProcessedFile> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { content: content.trim(), title, fileType: 'text' };
    } catch (error) {
      throw new Error(`Failed to process text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async createEmbedding(text: string): Promise<Record<string, number>> {
    const words = text
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g) || [];

    // Count frequencies (TF)
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Normalize by total words for simple TF
    const totalWords = words.length;
    for (const word in freq) {
      freq[word] = freq[word] / totalWords;
    }

    return freq;
  }

  static calculateSimilarity(embedding1: Record<string, number>, embedding2: Record<string, number>): number {
    // Cosine similarity for sparse vectors represented as frequency maps
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const word in embedding1) {
      const val1 = embedding1[word] || 0;
      const val2 = embedding2[word] || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
    }

    for (const val of Object.values(embedding2)) {
      norm2 += val * val;
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}
