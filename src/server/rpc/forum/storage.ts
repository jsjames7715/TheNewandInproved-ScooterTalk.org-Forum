import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import type {
  User,
  Category,
  Board,
  Thread,
  Post,
  ArchivedThread,
  SessionToken,
} from '../../lib/forum-types.ts';

const storage = createStorage({
  driver: fsDriver({ base: '.storage/forum' }),
});

// Types for better type safety
type ForumKey = `user:${string}` | `category:${string}` | `board:${string}` | `thread:${string}` | `post:${string}` | `archived:${string}` | `session:${string}` | string;

// User operations
export const userStorage = {
  async create(user: Omit<User, 'id'>) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullUser: User = { ...user, id };
    await storage.setItem(`user:${id}`, fullUser);
    await storage.setItem(`email:${user.email}`, id);
    await storage.setItem(`username:${user.username}`, id);
    return fullUser;
  },

  async get(id: string): Promise<User | null> {
    return storage.getItem(`user:${id}`) as Promise<User | null>;
  },

  async getByEmail(email: string): Promise<User | null> {
    const id = await storage.getItem(`email:${email}`) as string | null;
    if (!id) return null;
    return userStorage.get(id);
  },

  async getByUsername(username: string): Promise<User | null> {
    const id = await storage.getItem(`username:${username}`) as string | null;
    if (!id) return null;
    return userStorage.get(id);
  },

  async update(id: string, updates: Partial<User>) {
    const user = await userStorage.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...updates };
    await storage.setItem(`user:${id}`, updated);
    return updated;
  },

  async list(): Promise<User[]> {
    const keys = await storage.getKeys();
    const userKeys = keys.filter(k => k.startsWith('user:'));
    const users = await Promise.all(
      userKeys.map(k => storage.getItem(k) as Promise<User>)
    );
    return users;
  },
};

// Category operations
export const categoryStorage = {
  async create(category: Omit<Category, 'id'>) {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullCategory: Category = { ...category, id };
    await storage.setItem(`category:${id}`, fullCategory);
    await storage.setItem(`category:slug:${category.slug}`, id);
    return fullCategory;
  },

  async get(id: string): Promise<Category | null> {
    return storage.getItem(`category:${id}`) as Promise<Category | null>;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const id = await storage.getItem(`category:slug:${slug}`) as string | null;
    if (!id) return null;
    return categoryStorage.get(id);
  },

  async list(): Promise<Category[]> {
    const keys = await storage.getKeys();
    const catKeys = keys.filter(k => k.startsWith('category:') && !k.includes(':slug:'));
    const categories = await Promise.all(
      catKeys.map(k => storage.getItem(k) as Promise<Category>)
    );
    return categories.sort((a, b) => a.order - b.order);
  },

  async update(id: string, updates: Partial<Category>) {
    const category = await categoryStorage.get(id);
    if (!category) throw new Error('Category not found');
    const updated = { ...category, ...updates };
    await storage.setItem(`category:${id}`, updated);
    return updated;
  },
};

// Board operations
export const boardStorage = {
  async create(board: Omit<Board, 'id'>) {
    const id = `board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullBoard: Board = { ...board, id };
    await storage.setItem(`board:${id}`, fullBoard);
    await storage.setItem(`board:slug:${board.slug}`, id);
    await storage.setItem(`board:category:${board.categoryId}`, [...(await storage.getItem(`board:category:${board.categoryId}`) as string[] || []), id]);
    return fullBoard;
  },

  async get(id: string): Promise<Board | null> {
    return storage.getItem(`board:${id}`) as Promise<Board | null>;
  },

  async getBySlug(slug: string): Promise<Board | null> {
    const id = await storage.getItem(`board:slug:${slug}`) as string | null;
    if (!id) return null;
    return boardStorage.get(id);
  },

  async listByCategory(categoryId: string): Promise<Board[]> {
    const boardIds = await storage.getItem(`board:category:${categoryId}`) as string[] || [];
    const boards = await Promise.all(
      boardIds.map(id => boardStorage.get(id))
    );
    return boards.filter((b): b is Board => b !== null).sort((a, b) => a.order - b.order);
  },

  async update(id: string, updates: Partial<Board>) {
    const board = await boardStorage.get(id);
    if (!board) throw new Error('Board not found');
    const updated = { ...board, ...updates };
    await storage.setItem(`board:${id}`, updated);
    return updated;
  },
};

// Thread operations
export const threadStorage = {
  async create(thread: Omit<Thread, 'id'>) {
    const id = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullThread: Thread = { ...thread, id };
    await storage.setItem(`thread:${id}`, fullThread);
    await storage.setItem(`thread:slug:${thread.slug}`, id);
    
    // Add to board's thread list
    const boardThreads = await storage.getItem(`board:threads:${thread.boardId}`) as string[] || [];
    await storage.setItem(`board:threads:${thread.boardId}`, [id, ...boardThreads]);
    
    // Update board
    const board = await boardStorage.get(thread.boardId);
    if (board) {
      await boardStorage.update(thread.boardId, {
        threadCount: board.threadCount + 1,
        lastPostAt: fullThread.createdAt,
        lastPostBy: thread.authorUsername,
      });
    }
    
    return fullThread;
  },

  async get(id: string): Promise<Thread | null> {
    return storage.getItem(`thread:${id}`) as Promise<Thread | null>;
  },

  async getBySlug(slug: string): Promise<Thread | null> {
    const id = await storage.getItem(`thread:slug:${slug}`) as string | null;
    if (!id) return null;
    return threadStorage.get(id);
  },

  async listByBoard(boardId: string, limit = 50, offset = 0): Promise<Thread[]> {
    const threadIds = (await storage.getItem(`board:threads:${boardId}`) as string[] || []).slice(offset, offset + limit);
    const threads = await Promise.all(
      threadIds.map(id => threadStorage.get(id))
    );
    return threads.filter((t): t is Thread => t !== null);
  },

  async update(id: string, updates: Partial<Thread>) {
    const thread = await threadStorage.get(id);
    if (!thread) throw new Error('Thread not found');
    const updated = { ...thread, ...updates };
    await storage.setItem(`thread:${id}`, updated);
    return updated;
  },

  async incrementViewCount(id: string) {
    const thread = await threadStorage.get(id);
    if (!thread) return;
    await threadStorage.update(id, { viewCount: thread.viewCount + 1 });
  },
};

// Post operations
export const postStorage = {
  async create(post: Omit<Post, 'id'>) {
    const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPost: Post = { ...post, id };
    await storage.setItem(`post:${id}`, fullPost);
    
    // Add to thread's posts list
    const threadPosts = await storage.getItem(`thread:posts:${post.threadId}`) as string[] || [];
    await storage.setItem(`thread:posts:${post.threadId}`, [...threadPosts, id]);
    
    // Update thread
    const thread = await threadStorage.get(post.threadId);
    if (thread) {
      await threadStorage.update(post.threadId, {
        postCount: thread.postCount + 1,
        lastPostAt: fullPost.createdAt,
        lastPostBy: post.authorUsername,
      });
    }
    
    // Update board
    const board = await boardStorage.get(post.boardId);
    if (board) {
      await boardStorage.update(post.boardId, {
        postCount: board.postCount + 1,
        lastPostAt: fullPost.createdAt,
        lastPostBy: post.authorUsername,
      });
    }
    
    // Update user
    const user = await userStorage.get(post.authorId);
    if (user) {
      await userStorage.update(post.authorId, {
        postCount: user.postCount + 1,
        lastActive: fullPost.createdAt,
      });
    }
    
    return fullPost;
  },

  async get(id: string): Promise<Post | null> {
    return storage.getItem(`post:${id}`) as Promise<Post | null>;
  },

  async listByThread(threadId: string, limit = 50, offset = 0): Promise<Post[]> {
    const postIds = (await storage.getItem(`thread:posts:${threadId}`) as string[] || []).slice(offset, offset + limit);
    const posts = await Promise.all(
      postIds.map(id => postStorage.get(id))
    );
    return posts.filter((p): p is Post => p !== null);
  },

  async update(id: string, updates: Partial<Post>) {
    const post = await postStorage.get(id);
    if (!post) throw new Error('Post not found');
    const updated = { ...post, ...updates };
    await storage.setItem(`post:${id}`, updated);
    return updated;
  },
};

// Session operations
export const sessionStorage = {
  async create(userId: string, expiresIn = 7 * 24 * 60 * 60 * 1000) {
    const id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const session: SessionToken = {
      id,
      userId,
      token,
      expiresAt: Date.now() + expiresIn,
      createdAt: Date.now(),
    };
    await storage.setItem(`session:${token}`, session);
    await storage.setItem(`user:sessions:${userId}`, [...(await storage.getItem(`user:sessions:${userId}`) as string[] || []), token]);
    return session;
  },

  async getByToken(token: string): Promise<SessionToken | null> {
    const session = await storage.getItem(`session:${token}`) as SessionToken | null;
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await sessionStorage.revoke(token);
      return null;
    }
    return session;
  },

  async revoke(token: string) {
    const session = await storage.getItem(`session:${token}`) as SessionToken | null;
    if (session) {
      await storage.removeItem(`session:${token}`);
      const userSessions = await storage.getItem(`user:sessions:${session.userId}`) as string[] || [];
      await storage.setItem(`user:sessions:${session.userId}`, userSessions.filter(t => t !== token));
    }
  },
};

export default storage;
