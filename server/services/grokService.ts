import OpenAI from "openai";

export class GrokService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: process.env.XAI_API_KEY || process.env.GROK_API_KEY || "default_key"
    });
  }

  async generateAnswer(query: string, context: string): Promise<string> {
    try {
      const systemPrompt = `You are an AI study assistant specializing in computer science topics, placement preparation, and code analysis. 
      
      You have access to the user's personal study materials, notes, GitHub repositories, and placement questions. 
      Use the provided context to give accurate, detailed answers.
      
      When referencing sources, mention which document or repository the information comes from.
      
      Keep answers focused, practical, and educational.`;

      const userPrompt = `Question: ${query}

Context from user's materials:
${context}

Please provide a comprehensive answer based on the context provided.`;

      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Grok API error:', error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }

  async generateChatResponse(messages: Array<{ role: string; content: string }>, context?: string): Promise<string> {
    try {
      const systemMessage = {
        role: "system" as const,
        content: `You are an AI study assistant for a computer science student. You have access to their notes, GitHub projects, and placement questions.
        
        ${context ? `Current context:\n${context}` : ''}
        
        Be helpful, educational, and reference the user's materials when relevant.`
      };

      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [systemMessage, ...messages],
        max_tokens: 800,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Grok API error:', error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system" as const,
            content: "You are a code analysis expert. Analyze the provided code and explain its functionality, architecture, and key components."
          },
          {
            role: "user" as const,
            content: `Please analyze this ${language} code and explain its purpose and structure:\n\n${code}`
          }
        ],
        max_tokens: 600,
        temperature: 0.5
      });

      return response.choices[0]?.message?.content || "Code analysis unavailable.";
    } catch (error) {
      console.error('Code analysis error:', error);
      return "Failed to analyze code.";
    }
  }
}
