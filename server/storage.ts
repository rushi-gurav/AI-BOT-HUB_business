import { 
  users, 
  bots, 
  documents, 
  chatMessages, 
  embeddings,
  type User, 
  type InsertUser,
  type Bot,
  type InsertBot,
  type Document,
  type InsertDocument,
  type ChatMessage,
  type InsertChatMessage,
  type Embedding,
  type InsertEmbedding
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserBySessionId(sessionId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bots
  createBot(bot: InsertBot & { userId: string }): Promise<Bot>;
  getBotsByUserId(userId: string): Promise<Bot[]>;
  getBot(id: string): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<void>;
  updateBot(id: string, updates: Partial<InsertBot>): Promise<Bot | undefined>;
  
  // Documents
  createDocument(document: InsertDocument & { botId: string }): Promise<Document>;
  getDocumentsByBotId(botId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<void>;
  
  // Chat Messages
  createChatMessage(message: InsertChatMessage & { botId: string, sessionId: string }): Promise<ChatMessage>;
  getChatMessagesByBotAndSession(botId: string, sessionId: string): Promise<ChatMessage[]>;
  
  // Embeddings
  createEmbedding(embedding: InsertEmbedding & { documentId: string }): Promise<Embedding>;
  getEmbeddingsByDocumentId(documentId: string): Promise<Embedding[]>;
  deleteEmbeddingsByDocumentId(documentId: string): Promise<void>;
  searchSimilarEmbeddings(botId: string, queryEmbedding: number[], limit?: number): Promise<(Embedding & { content: string, documentName: string })[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.sessionId, sessionId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Bots
  async createBot(botData: InsertBot & { userId: string }): Promise<Bot> {
    const [bot] = await db
      .insert(bots)
      .values(botData)
      .returning();
    return bot;
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.userId, userId)).orderBy(desc(bots.createdAt));
  }

  async getBot(id: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async deleteBot(id: string): Promise<void> {
    await db.delete(bots).where(eq(bots.id, id));
  }

  async updateBot(id: string, updates: Partial<InsertBot>): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set(updates)
      .where(eq(bots.id, id))
      .returning();
    return bot || undefined;
  }

  // Documents
  async createDocument(documentData: InsertDocument & { botId: string }): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return document;
  }

  async getDocumentsByBotId(botId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.botId, botId));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Chat Messages
  async createChatMessage(messageData: InsertChatMessage & { botId: string, sessionId: string }): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChatMessagesByBotAndSession(botId: string, sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.botId, botId), eq(chatMessages.sessionId, sessionId)))
      .orderBy(chatMessages.createdAt);
  }

  // Embeddings
  async createEmbedding(embeddingData: InsertEmbedding & { documentId: string }): Promise<Embedding> {
    const [embedding] = await db
      .insert(embeddings)
      .values(embeddingData)
      .returning();
    return embedding;
  }

  async getEmbeddingsByDocumentId(documentId: string): Promise<Embedding[]> {
    return await db.select().from(embeddings).where(eq(embeddings.documentId, documentId));
  }

  async deleteEmbeddingsByDocumentId(documentId: string): Promise<void> {
    await db.delete(embeddings).where(eq(embeddings.documentId, documentId));
  }

  async searchSimilarEmbeddings(botId: string, queryEmbedding: number[], limit: number = 5): Promise<(Embedding & { content: string, documentName: string })[]> {
    // Note: This is a simplified similarity search. In production, you'd want to use a vector database
    // For now, we'll return recent embeddings from the bot's documents
    const result = await db
      .select({
        id: embeddings.id,
        documentId: embeddings.documentId,
        content: embeddings.content,
        embedding: embeddings.embedding,
        createdAt: embeddings.createdAt,
        documentName: documents.originalName,
      })
      .from(embeddings)
      .innerJoin(documents, eq(embeddings.documentId, documents.id))
      .innerJoin(bots, eq(documents.botId, bots.id))
      .where(eq(bots.id, botId))
      .limit(limit);

    return result as (Embedding & { content: string, documentName: string })[];
  }
}

export const storage = new DatabaseStorage();
