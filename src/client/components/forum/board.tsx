import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { forumClient } from '../../forum-client.ts';
import { PlusIcon, ClockIcon, EyeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Thread {
  id: string;
  title: string;
  slug: string;
  authorUsername: string;
  isPinned: boolean;
  isLocked: boolean;
  postCount: number;
  viewCount: number;
  lastPostAt: number;
  lastPostBy?: string;
  tags: string[];
}

interface Board {
  id: string;
  name: string;
  description: string;
  moderators: string[];
  postCount: number;
  threadCount: number;
  lastPostAt: number;
}

export function ForumBoard() {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = React.useState<Board | null>(null);
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setIsLoading(true);
      const data = await forumClient.content.getBoard({ boardId: boardId! });
      setBoard(data.board);
      setThreads(data.threads);
      setError(null);
    } catch (err) {
      console.error('Failed to load board:', err);
      setError('Failed to load board');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastPost = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                  <div className="w-12 h-12 bg-neutral-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Board not found'}</div>
        <button
          onClick={loadBoard}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">{board.name}</h1>
            <p className="text-neutral-600 mb-4">{board.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-neutral-500">
              <span className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                {board.threadCount} topics
              </span>
              <span className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                {board.postCount} posts
              </span>
              {board.moderators.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Moderated
                </span>
              )}
            </div>
          </div>
          
          <Link
            to="/forum/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Topic
          </Link>
        </div>
      </div>

      {/* Threads */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {threads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No topics yet</h3>
            <p className="text-neutral-600 mb-6">Be the first to start a discussion in this board!</p>
            <Link
              to="/forum/create"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create First Topic
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {threads.map((thread) => (
              <div key={thread.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {thread.isPinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📌 Pinned
                        </span>
                      )}
                      {thread.isLocked && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/forum/thread/${thread.id}`}
                      className="text-lg font-semibold text-neutral-800 hover:text-primary-600 transition-colors"
                    >
                      {thread.title}
                    </Link>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 mt-2">
                      <span>by {thread.authorUsername}</span>
                      <span>{thread.viewCount} views</span>
                      <span>{thread.postCount} replies</span>
                      {thread.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {thread.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {thread.tags.length > 3 && (
                            <span className="text-xs text-neutral-500">+{thread.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {thread.lastPostBy && (
                    <div className="text-right ml-6">
                      <div className="text-sm text-neutral-500 mb-1 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatLastPost(thread.lastPostAt)}
                      </div>
                      <div className="text-sm font-medium text-neutral-600">
                        by {thread.lastPostBy}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}