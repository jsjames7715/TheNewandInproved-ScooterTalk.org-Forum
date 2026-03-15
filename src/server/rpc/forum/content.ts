import { z } from 'zod';
import { os } from '@orpc/server';
import {
  categoryStorage,
  boardStorage,
  threadStorage,
  postStorage,
  userStorage,
  sessionStorage,
} from './storage.ts';
import type { Thread } from '../../lib/forum-types.ts';

// Get all categories with their boards
export const getCategories = os
  .handler(async () => {
    const categories = await categoryStorage.list();
    const categoriesWithBoards = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        boards: await boardStorage.listByCategory(cat.id),
      }))
    );
    return categoriesWithBoards;
  });

// Get a specific board with recent threads
export const getBoard = os
  .input(z.object({
    boardId: z.string(),
    limit: z.number().default(20),
    offset: z.number().default(0),
  }))
  .handler(async ({ input }) => {
    const board = await boardStorage.get(input.boardId);
    if (!board) throw new Error('Board not found');

    const threads = await threadStorage.listByBoard(
      input.boardId,
      input.limit,
      input.offset
    );

    // Get last post for each thread
    const threadsWithLastPost = await Promise.all(
      threads.map(async (thread) => ({
        ...thread,
        lastPost: thread.lastPostBy ? {
          author: thread.lastPostBy,
          at: thread.lastPostAt,
        } : undefined,
      }))
    );

    return {
      board,
      threads: threadsWithLastPost,
      total: board.threadCount,
    };
  });

// Create a new thread
export const createThread = os
  .input(z.object({
    sessionToken: z.string(),
    boardId: z.string(),
    title: z.string().min(3).max(200),
    content: z.string().min(1).max(50000),
    tags: z.array(z.string()).default([]),
  }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) throw new Error('Not authenticated');

    const user = await userStorage.get(session.userId);
    if (!user) throw new Error('User not found');

    const board = await boardStorage.get(input.boardId);
    if (!board) throw new Error('Board not found');

    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const thread = await threadStorage.create({
      boardId: input.boardId,
      title: input.title,
      slug,
      authorId: user.id,
      authorUsername: user.username,
      content: input.content,
      isPinned: false,
      isLocked: false,
      isArchived: false,
      tags: input.tags,
      postCount: 1, // Initial post
      viewCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: user.username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create the initial post
    await postStorage.create({
      threadId: thread.id,
      boardId: input.boardId,
      authorId: user.id,
      authorUsername: user.username,
      content: input.content,
      likes: 0,
      createdAt: Date.now(),
    });

    return thread;
  });

// Get a thread with all posts
export const getThread = os
  .input(z.object({
    threadId: z.string(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .handler(async ({ input }) => {
    const thread = await threadStorage.get(input.threadId);
    if (!thread) throw new Error('Thread not found');

    // Increment view count
    await threadStorage.incrementViewCount(input.threadId);

    const posts = await postStorage.listByThread(
      input.threadId,
      input.limit,
      input.offset
    );

    // Get author info for each post
    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const author = await userStorage.get(post.authorId);
        return {
          ...post,
          authorAvatar: author?.avatar,
          authorRole: author?.role,
        };
      })
    );

    return {
      thread,
      posts: postsWithAuthor,
      total: thread.postCount,
    };
  });

// Create a reply in a thread
export const createReply = os
  .input(z.object({
    sessionToken: z.string(),
    threadId: z.string(),
    content: z.string().min(1).max(50000),
  }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) throw new Error('Not authenticated');

    const user = await userStorage.get(session.userId);
    if (!user) throw new Error('User not found');

    const thread = await threadStorage.get(input.threadId);
    if (!thread) throw new Error('Thread not found');

    if (thread.isLocked) throw new Error('Thread is locked');

    const post = await postStorage.create({
      threadId: input.threadId,
      boardId: thread.boardId,
      authorId: user.id,
      authorUsername: user.username,
      content: input.content,
      likes: 0,
      createdAt: Date.now(),
    });

    return post;
  });

// Edit a post
export const editPost = os
  .input(z.object({
    sessionToken: z.string(),
    postId: z.string(),
    content: z.string().min(1).max(50000),
  }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) throw new Error('Not authenticated');

    const user = await userStorage.get(session.userId);
    if (!user) throw new Error('User not found');

    const post = await postStorage.get(input.postId);
    if (!post) throw new Error('Post not found');

    // Check authorization
    if (post.authorId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      throw new Error('Not authorized to edit this post');
    }

    const updated = await postStorage.update(input.postId, {
      content: input.content,
      editedAt: Date.now(),
      editedBy: user.username,
    });

    return updated;
  });

// Search threads
export const searchThreads = os
  .input(z.object({
    query: z.string().min(2),
    boardId: z.string().optional(),
    limit: z.number().default(20),
  }))
  .handler(async ({ input }) => {
    // TODO: Implement full-text search
    return { threads: [] };
  });

// Get popular threads (trending)
export const getPopularThreads = os
  .input(z.object({
    limit: z.number().default(10),
  }))
  .handler(async ({ input }) => {
    const categories = await categoryStorage.list();
    const allThreads: Thread[] = [];

    for (const category of categories) {
      const boards = await boardStorage.listByCategory(category.id);
      for (const board of boards) {
        const threads = await threadStorage.listByBoard(board.id, 100);
        allThreads.push(...threads);
      }
    }

    // Sort by view count and recency
    const popular = allThreads
      .sort((a, b) => {
        const viewScore = b.viewCount - a.viewCount;
        if (viewScore !== 0) return viewScore;
        return b.lastPostAt - a.lastPostAt;
      })
      .slice(0, input.limit);

    return popular;
  });

// Like a post
export const likePost = os
  .input(z.object({
    sessionToken: z.string(),
    postId: z.string(),
  }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) throw new Error('Not authenticated');

    const post = await postStorage.get(input.postId);
    if (!post) throw new Error('Post not found');

    // TODO: Track which users have liked this post to prevent double-liking
    const updated = await postStorage.update(input.postId, {
      likes: post.likes + 1,
    });

    return updated;
  });
