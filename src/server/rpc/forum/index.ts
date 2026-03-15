import * as auth from './auth.ts';
import * as content from './content.ts';

export const forumRouter = {
  auth: {
    register: auth.register,
    login: auth.login,
    logout: auth.logout,
    verifyEmail: auth.verifyEmail,
    getCurrentUser: auth.getCurrentUser,
    updateProfile: auth.updateProfile,
  },
  content: {
    getCategories: content.getCategories,
    getBoard: content.getBoard,
    createThread: content.createThread,
    getThread: content.getThread,
    createReply: content.createReply,
    editPost: content.editPost,
    searchThreads: content.searchThreads,
    getPopularThreads: content.getPopularThreads,
    likePost: content.likePost,
  },
};

export type ForumRouter = typeof forumRouter;
