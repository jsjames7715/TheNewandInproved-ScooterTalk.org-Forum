import { rpcClient } from './rpc-client.ts';

export const forumClient = rpcClient.forum;

// Helper function to get session token
export function getSessionToken(): string | null {
  return localStorage.getItem('forum-session');
}

// Helper function to set session token
export function setSessionToken(token: string | null): void {
  if (token) {
    localStorage.setItem('forum-session', token);
  } else {
    localStorage.removeItem('forum-session');
  }
}

// Helper function to clear session
export function clearSession(): void {
  localStorage.removeItem('forum-session');
}
