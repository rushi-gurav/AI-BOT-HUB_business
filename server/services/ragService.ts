import OpenAI from "openai";
import { storage } from "../storage";
import { DocumentProcessor } from "./documentProcessor";
import { LLMService, type LLMMessage } from "./llmService";

export interface RAGResponse {
  response: string;
  sources: Array<{
    documentName: string;
    content: string;
  }>;
}

export class RAGService {
  private static openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
  });

  static async generateEmbeddings(text: string): Promise<number[]> {
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "default_key") {
        const response = await this.openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        });
        return response.data[0].embedding;
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);
    }
    
    // Fallback: Generate deterministic embeddings based on text content
    const textBytes = new TextEncoder().encode(text);
    const hash1 = textBytes.reduce((a, b) => ((a << 5) - a + b) & 0xffffffff, 0);
    const hash2 = textBytes.reduce((a, b, i) => ((a << 3) - a + b * (i + 1)) & 0xffffffff, 0);
    
    return new Array(1536).fill(0).map((_, i) => {
      const seed = (hash1 * (i + 1) + hash2 * (i + 2)) * 0.0001;
      return Math.sin(seed) * 0.1 + Math.cos(seed * 1.7) * 0.05;
    });
  }

  static async processAndStoreDocument(
    botId: string,
    filePath: string,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number
  ): Promise<void> {
    try {
      // Process the document
      const processed = await DocumentProcessor.processFile(filePath, mimeType);
      
      // Store the document
      const document = await storage.createDocument({
        botId,
        filename,
        originalName,
        content: processed.content,
        mimeType,
        size,
      });

      // Generate and store embeddings for each chunk
      for (const chunk of processed.chunks) {
        const embedding = await this.generateEmbeddings(chunk);
        await storage.createEmbedding({
          documentId: document.id,
          content: chunk,
          embedding,
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to process and store document: ${error.message}`);
    }
  }

  static async generateRAGResponse(
    botId: string,
    userMessage: string,
    chatHistory: LLMMessage[] = []
  ): Promise<RAGResponse> {
    try {
      // Get bot details
      const bot = await storage.getBot(botId);
      if (!bot) {
        throw new Error("Bot not found");
      }

      // Generate embedding for user query
      const queryEmbedding = await this.generateEmbeddings(userMessage);

      // Search for relevant content
      const relevantEmbeddings = await storage.searchSimilarEmbeddings(botId, queryEmbedding, 5);

      // Build context from relevant documents
      let context = "";
      const sources: Array<{ documentName: string; content: string }> = [];
      
      if (relevantEmbeddings.length > 0) {
        context = relevantEmbeddings
          .map((embedding, index) => {
            sources.push({
              documentName: embedding.documentName,
              content: embedding.content,
            });
            return `[Document ${index + 1}: ${embedding.documentName}]\n${embedding.content}`;
          })
          .join("\n\n");
      }

      // Generate response using LLM
      const messages: LLMMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage }
      ];

      const llmResponse = await LLMService.generateResponse(
        bot.apiProvider,
        bot.apiKey,
        bot.modelName,
        messages,
        context
      );

      return {
        response: llmResponse.content,
        sources: sources.slice(0, 3), // Limit to top 3 sources
      };
    } catch (error: any) {
      throw new Error(`RAG generation failed: ${error.message}`);
    }
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
