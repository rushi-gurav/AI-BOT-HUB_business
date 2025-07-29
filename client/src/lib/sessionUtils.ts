import { randomUUID } from 'crypto';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('ai-bot-hub-session');
  
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUID();
    localStorage.setItem('ai-bot-hub-session', sessionId);
  }
  
  return sessionId;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ai-bot-hub-session');
}
