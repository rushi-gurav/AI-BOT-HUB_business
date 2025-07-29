import * as fs from 'fs';
import * as path from 'path';

export interface ProcessedDocument {
  content: string;
  chunks: string[];
}

export class DocumentProcessor {
  static async processFile(filePath: string, mimeType: string): Promise<ProcessedDocument> {
    try {
      let content = '';
      
      if (mimeType === 'application/pdf') {
        content = await this.processPDF(filePath);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content = await this.processDOCX(filePath);
      } else if (mimeType === 'text/plain') {
        content = await this.processText(filePath);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      const chunks = this.chunkText(content);
      
      return {
        content,
        chunks
      };
    } catch (error: any) {
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  private static async processPDF(filePath: string): Promise<string> {
    // For production, you'd use a library like pdf-parse
    // For now, we'll return a placeholder
    const fileContent = fs.readFileSync(filePath);
    return `[PDF Content] - File size: ${fileContent.length} bytes. PDF processing requires pdf-parse library.`;
  }

  private static async processDOCX(filePath: string): Promise<string> {
    // For production, you'd use a library like mammoth
    // For now, we'll return a placeholder
    const fileContent = fs.readFileSync(filePath);
    return `[DOCX Content] - File size: ${fileContent.length} bytes. DOCX processing requires mammoth library.`;
  }

  private static async processText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }

  private static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      
      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastQuestion = chunk.lastIndexOf('?');
        const lastExclamation = chunk.lastIndexOf('!');
        
        const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
        
        if (lastSentenceEnd > start + chunkSize * 0.5) {
          chunks.push(chunk.slice(0, lastSentenceEnd + 1).trim());
          start = start + lastSentenceEnd + 1 - overlap;
        } else {
          chunks.push(chunk.trim());
          start = end - overlap;
        }
      } else {
        chunks.push(chunk.trim());
        break;
      }
    }

    return chunks.filter(chunk => chunk.length > 0);
  }
}
