import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { RAGService } from "./services/ragService";
import { z } from "zod";
import multer from "multer";
import type { Request } from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { insertBotSchema, insertChatMessageSchema } from "@shared/schema";
import session from "express-session";

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2, // Max 2 files
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// Session management
function getOrCreateSession(req: any): string {
  if (!req.session.sessionId) {
    req.session.sessionId = randomUUID();
  }
  return req.session.sessionId;
}

async function getOrCreateUser(sessionId: string, isAdmin = false) {
  let user = await storage.getUserBySessionId(sessionId);
  
  if (!user) {
    user = await storage.createUser({
      sessionId,
      isAdmin,
    });
  }
  
  return user;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ai-bot-hub-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  }));

  // Create bot endpoint
  app.post('/api/bots', upload.array('documents', 2), async (req, res) => {
    try {
      const sessionId = getOrCreateSession(req);
      
      // Validate admin key if provided
      const isAdmin = req.body.adminKey === 'Rushi@123456coder';
      
      const user = await getOrCreateUser(sessionId, isAdmin);
      
      // Check bot limit for non-admin users
      if (!user.isAdmin) {
        const existingBots = await storage.getBotsByUserId(user.id);
        if (existingBots.length >= 2) {
          return res.status(403).json({ 
            error: "Bot limit reached. Upgrade to premium for unlimited bots.",
            requiresPremium: true 
          });
        }
      }

      // Validate bot data
      const botData = insertBotSchema.parse({
        name: req.body.name,
        description: req.body.description || "",
        greeting: req.body.greeting,
        apiProvider: req.body.apiProvider,
        apiKey: req.body.apiKey,
        modelName: req.body.modelName,
      });

      // Create bot
      const bot = await storage.createBot({
        ...botData,
        userId: user.id,
      });

      // Process uploaded documents
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            await RAGService.processAndStoreDocument(
              bot.id,
              file.path,
              file.filename,
              file.originalname,
              file.mimetype,
              file.size
            );
            
            // Clean up uploaded file
            fs.unlinkSync(file.path);
          } catch (error: any) {
            console.error(`Error processing document ${file.originalname}:`, error);
          }
        }
      }

      res.json({ 
        bot,
        message: user.isAdmin ? "✅ Unlimited Bot Access Enabled" : "Bot created successfully"
      });
    } catch (error: any) {
      console.error("Error creating bot:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's bots
  app.get('/api/bots', async (req, res) => {
    try {
      const sessionId = getOrCreateSession(req);
      const user = await getOrCreateUser(sessionId);
      
      const bots = await storage.getBotsByUserId(user.id);
      
      // Add document count to each bot
      const botsWithCounts = await Promise.all(
        bots.map(async (bot) => {
          const documents = await storage.getDocumentsByBotId(bot.id);
          return {
            ...bot,
            documentCount: documents.length,
          };
        })
      );
      
      res.json({ 
        bots: botsWithCounts,
        isAdmin: user.isAdmin,
        canCreateMore: user.isAdmin || bots.length < 2
      });
    } catch (error: any) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific bot
  app.get('/api/bots/:id', async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      const documents = await storage.getDocumentsByBotId(bot.id);
      
      res.json({
        ...bot,
        apiKey: undefined, // Don't expose API key
        documents: documents.map(doc => ({
          id: doc.id,
          originalName: doc.originalName,
          size: doc.size,
          createdAt: doc.createdAt,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete bot
  app.delete('/api/bots/:id', async (req, res) => {
    try {
      const sessionId = getOrCreateSession(req);
      const user = await getOrCreateUser(sessionId);
      const bot = await storage.getBot(req.params.id);
      
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      if (bot.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteBot(req.params.id);
      res.json({ message: "Bot deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Chat with bot
  app.post('/api/chat/:botId', async (req, res) => {
    try {
      const { botId } = req.params;
      const sessionId = getOrCreateSession(req);
      
      const messageData = insertChatMessageSchema.parse({
        type: 'user',
        content: req.body.message,
        sources: null,
      });

      // Store user message
      await storage.createChatMessage({
        ...messageData,
        botId,
        sessionId,
      });

      // Get chat history
      const chatHistory = await storage.getChatMessagesByBotAndSession(botId, sessionId);
      const llmMessages = chatHistory
        .filter(msg => msg.type !== 'system')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));

      // Generate RAG response
      const ragResponse = await RAGService.generateRAGResponse(
        botId,
        req.body.message,
        llmMessages.slice(-10) // Last 10 messages for context
      );

      // Store bot response
      await storage.createChatMessage({
        type: 'bot',
        content: ragResponse.response,
        sources: ragResponse.sources,
        botId,
        sessionId,
      });

      res.json({
        response: ragResponse.response,
        sources: ragResponse.sources,
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get chat history
  app.get('/api/chat/:botId/history', async (req, res) => {
    try {
      const { botId } = req.params;
      const sessionId = getOrCreateSession(req);
      
      const messages = await storage.getChatMessagesByBotAndSession(botId, sessionId);
      
      res.json({ messages });
    } catch (error: any) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reprocess documents endpoint
  app.post('/api/bots/:id/reprocess', async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = getOrCreateSession(req);
      const user = await getOrCreateUser(sessionId);
      const bot = await storage.getBot(id);
      
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      if (bot.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get all documents for this bot
      const documents = await storage.getDocumentsByBotId(id);
      
      for (const doc of documents) {
        // Delete existing embeddings
        await storage.deleteEmbeddingsByDocumentId(doc.id);
        
        // Reprocess document if file still exists
        const filePath = path.join(process.cwd(), "uploads", doc.filename);
        if (fs.existsSync(filePath)) {
          try {
            await RAGService.processAndStoreDocument(
              id,
              filePath,
              doc.filename,
              doc.originalName,
              doc.mimeType,
              doc.size
            );
          } catch (error: any) {
            console.error(`Error reprocessing document ${doc.originalName}:`, error);
          }
        }
      }

      res.json({ message: "Documents reprocessed successfully" });
    } catch (error: any) {
      console.error("Error reprocessing documents:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Embed endpoint for external sites
  app.get('/embed/:botId', async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.botId);
      
      if (!bot) {
        return res.status(404).send('Bot not found');
      }

      // Return a minimal HTML page for embedding
      const embedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${bot.name} - AI Chat</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; font-family: 'Inter', sans-serif; }
            .glassmorphism { background: rgba(17, 17, 17, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
            .gradient-bg { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); }
          </style>
        </head>
        <body class="bg-black text-white h-screen">
          <div id="embed-chat" class="h-full flex flex-col">
            <div class="glassmorphism p-3 flex items-center justify-between border-b border-gray-700">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                  <span class="text-xs">🤖</span>
                </div>
                <span class="text-sm font-medium">${bot.name}</span>
              </div>
            </div>
            
            <div class="flex-1 p-3 overflow-y-auto" id="messages">
              <div class="flex items-start space-x-2 mb-3">
                <div class="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-xs">🤖</span>
                </div>
                <div class="bg-gray-800 p-2 rounded-lg text-sm max-w-xs">
                  ${bot.greeting}
                </div>
              </div>
            </div>
            
            <div class="p-3 border-t border-gray-700">
              <div class="flex items-center space-x-2">
                <input type="text" id="messageInput" placeholder="Type a message..." 
                       class="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <button id="sendButton" class="w-8 h-8 gradient-bg rounded-full flex items-center justify-center hover:opacity-90">
                  <span class="text-xs">📤</span>
                </button>
              </div>
            </div>
          </div>
          
          <script>
            const botId = '${bot.id}';
            const messagesContainer = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            
            async function sendMessage() {
              const message = messageInput.value.trim();
              if (!message) return;
              
              // Add user message
              addMessage(message, 'user');
              messageInput.value = '';
              
              try {
                const response = await fetch(\`/api/chat/\${botId}\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message }),
                });
                
                const data = await response.json();
                addMessage(data.response, 'bot');
              } catch (error) {
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
              }
            }
            
            function addMessage(content, type) {
              const messageDiv = document.createElement('div');
              messageDiv.className = 'flex items-start space-x-2 mb-3' + (type === 'user' ? ' justify-end' : '');
              
              if (type === 'user') {
                messageDiv.innerHTML = \`
                  <div class="bg-purple-600 p-2 rounded-lg text-sm max-w-xs text-white">
                    \${content}
                  </div>
                  <div class="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xs">👤</span>
                  </div>
                \`;
              } else {
                messageDiv.innerHTML = \`
                  <div class="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xs">🤖</span>
                  </div>
                  <div class="bg-gray-800 p-2 rounded-lg text-sm max-w-xs">
                    \${content}
                  </div>
                \`;
              }
              
              messagesContainer.appendChild(messageDiv);
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            sendButton.addEventListener('click', sendMessage);
            messageInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') sendMessage();
            });
          </script>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(embedHtml);
    } catch (error) {
      console.error("Error serving embed:", error);
      res.status(500).send('Error loading chat widget');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
