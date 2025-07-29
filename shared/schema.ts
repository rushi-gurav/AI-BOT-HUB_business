import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  greeting: text("greeting").notNull(),
  apiProvider: varchar("api_provider").notNull(), // openai, openrouter, gemini, grok, custom
  apiKey: text("api_key").notNull(),
  modelName: text("model_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  content: text("content").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }).notNull(),
  sessionId: varchar("session_id").notNull(),
  type: varchar("type").notNull(), // user, bot
  content: text("content").notNull(),
  sources: jsonb("sources"), // Document sources used for RAG
  createdAt: timestamp("created_at").defaultNow(),
});

export const embeddings = pgTable("embeddings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  embedding: jsonb("embedding").notNull(), // Vector embedding
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bots: many(bots),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  user: one(users, { fields: [bots.userId], references: [users.id] }),
  documents: many(documents),
  chatMessages: many(chatMessages),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  bot: one(bots, { fields: [documents.botId], references: [bots.id] }),
  embeddings: many(embeddings),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  bot: one(bots, { fields: [chatMessages.botId], references: [bots.id] }),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  document: one(documents, { fields: [embeddings.documentId], references: [documents.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  sessionId: true,
  isAdmin: true,
});

export const insertBotSchema = createInsertSchema(bots).pick({
  name: true,
  description: true,
  greeting: true,
  apiProvider: true,
  apiKey: true,
  modelName: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  filename: true,
  originalName: true,
  content: true,
  mimeType: true,
  size: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  type: true,
  content: true,
  sources: true,
});

export const insertEmbeddingSchema = createInsertSchema(embeddings).pick({
  content: true,
  embedding: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Embedding = typeof embeddings.$inferSelect;
export type InsertEmbedding = z.infer<typeof insertEmbeddingSchema>;
