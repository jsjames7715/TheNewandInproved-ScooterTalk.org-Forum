// Forum Types and Database Schema

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  bio?: string;
  createdAt: number;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: number;
  role: 'user' | 'moderator' | 'admin';
  postCount: number;
  lastActive: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
  createdAt?: number;
}

export interface Board {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  moderators: string[]; // user IDs
  postCount: number;
  threadCount: number;
  lastPostAt: number;
  lastPostBy?: string; // username
  order: number;
  createdAt?: number;
  isArchived: boolean;
}

export interface Thread {
  id: string;
  boardId: string;
  title: string;
  slug: string;
  authorId: string;
  authorUsername: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  isArchived: boolean;
  tags: string[];
  postCount: number;
  viewCount: number;
  lastPostAt: number;
  lastPostBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Post {
  id: string;
  threadId: string;
  boardId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  editedAt?: number;
  editedBy?: string;
  likes: number;
  createdAt: number;
}

export interface ArchivedThread {
  id: string;
  boardName: string;
  title: string;
  slug: string;
  author: string;
  posts: ArchivedPost[];
  tags: string[];
  createdAt: number;
  isArchived: true;
  source: 'wayback-machine' | 'import';
}

export interface ArchivedPost {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

export interface SessionToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}
