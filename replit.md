# AI Bot Hub - Project Overview

## Overview

AI Bot Hub is a comprehensive chatbot builder platform that enables users to create AI-powered chatbots with RAG (Retrieval-Augmented Generation) capabilities. Users can upload documents (PDF/DOCX) and build custom chatbots that answer questions based strictly on the uploaded content. The platform supports multiple AI providers (OpenAI, OpenRouter, Gemini, Grok, Custom) and offers bot embedding and PWA installation features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation of concerns:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with TailwindCSS
- **State Management**: TanStack Query for server state
- **Authentication**: Session-based using express-session with PostgreSQL store
- **File Processing**: Custom document processors for PDF/DOCX/TXT files
- **AI Integration**: Multiple LLM providers with unified interface

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Styling**: TailwindCSS with dark theme and gradient design system
- **Forms**: React Hook Form with Zod validation
- **PWA Support**: Service worker registration and install prompts
- **Responsive Design**: Mobile-first approach with glassmorphism aesthetics

### Backend Architecture
- **API Design**: RESTful endpoints with Express middleware
- **Database Layer**: Drizzle ORM with connection pooling via Neon
- **File Handling**: Multer for file uploads with type validation
- **Session Management**: express-session with connect-pg-simple store
- **Error Handling**: Centralized error middleware with proper status codes

### Database Schema
- **Users**: Session-based user management with admin flag
- **Bots**: Bot configurations with API provider settings
- **Documents**: File metadata and processed content storage
- **Chat Messages**: Conversation history with source tracking
- **Embeddings**: Vector embeddings for RAG functionality

### Services Layer
- **RAG Service**: Document processing and similarity search
- **LLM Service**: Unified interface for multiple AI providers
- **Document Processor**: Text extraction from various file formats
- **Storage Service**: Database abstraction layer

## Data Flow

1. **Bot Creation**: User uploads documents → Processing → Embedding generation → Bot configuration
2. **Chat Interaction**: User message → Similarity search → Context retrieval → LLM query → Response with sources
3. **Document Processing**: File upload → Content extraction → Text chunking → Vector embedding → Storage
4. **Session Management**: Auto-generated session IDs → User tracking → Bot limitations (2 bots for non-admin)

## External Dependencies

### AI Providers
- OpenAI API for embeddings and chat completions
- OpenRouter, Gemini, Grok APIs for alternative LLM access
- Custom model support via configurable endpoints

### Database & Infrastructure
- Neon PostgreSQL for serverless database hosting
- WebSocket support for real-time connections

### File Processing
- PDF processing capabilities (placeholder for pdf-parse)
- DOCX processing capabilities (placeholder for mammoth)
- Text file processing with chunking strategies

### UI & Styling
- Google Fonts (Inter) for typography
- Framer Motion for animations
- TailwindCSS for styling system
- Radix UI for accessible components

## Deployment Strategy

The application is designed for Replit deployment with the following considerations:

### Development Environment
- Vite dev server with HMR
- TypeScript compilation
- Environment variable management
- File upload handling in development

### Production Build
- Static asset optimization
- Bundle splitting for performance
- Service worker registration
- PWA manifest configuration

### Replit-Specific Features
- Development banner integration
- Cartographer plugin for debugging
- Runtime error overlay
- Free tier optimizations

### Key Constraints
- File upload limits (10MB, 2 files max)
- Bot creation limits (2 bots for non-admin users)
- Session-based authentication (no user registration)
- Admin access via hardcoded key ("Rushi@123456coder")

### PWA Features
- Offline capability with service worker
- App installation prompts
- Mobile-optimized interface
- Bot embedding in external websites

## Development Notes

- The application uses modern ES modules throughout
- TypeScript strict mode is enabled for better type safety
- Database migrations are handled via Drizzle Kit
- File uploads are stored locally (uploads directory)
- Environment variables required: DATABASE_URL, various API keys
- The system supports both development and production build processes

## Recent Fixes (July 29, 2025)

✅ **Critical Issues Resolved:**
- Fixed React hooks violation in Chat component
- Implemented proper document processing with mammoth/pdf-parse libraries
- Added fallback embeddings system for OpenAI quota limitations
- Fixed database constraint issues in chat messages
- Corrected admin key validation (Rushi@123456coder)
- Enhanced mobile responsiveness across all components
- Implemented proper RAG functionality with document-based responses

✅ **Bot Functionality Verified:**
- Document processing working correctly for DOCX files
- RAG responses based on actual document content
- Embeddings generation with OpenAI fallback system
- Chat history persistence and source attribution
- PWA installation working on desktop and mobile
- Admin unlimited bot creation working
- Bot embedding code generation functional

✅ **Current Status:**
- All critical errors resolved
- Bot responds accurately based on uploaded documents
- Admin functionality fully operational
- Mobile and desktop experience optimized
- Application ready for production use