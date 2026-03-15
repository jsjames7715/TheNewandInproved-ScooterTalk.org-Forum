import React from 'react';
import { Link } from 'react-router-dom';
import { rpcClient } from '../../rpc-client.ts';
import { PlusIcon, EyeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
  boards: Board[];
}

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  moderators: string[];
  postCount: number;
  threadCount: number;
  lastPostAt: number;
  lastPostBy?: string;
}

export function ForumHome() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await rpcClient.forum.content.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load forum categories');
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
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadCategories}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">Welcome to ScooterTalk</h1>
          <p className="text-primary-100 text-lg mb-6">
            An electric scooter community on a mission to stamp out transportation mediocrity.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/forum/create"
              className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Start New Discussion
            </Link>
            <Link
              to="/forum/search"
              className="inline-flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Browse Archives
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 px-6 py-4 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800">{category.name}</h2>
              <p className="text-neutral-600 mt-1">{category.description}</p>
            </div>

            <div className="divide-y divide-neutral-200">
              {category.boards.map((board) => (
                <div key={board.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/forum/board/${board.id}`}
                          className="text-lg font-semibold text-neutral-800 hover:text-primary-600 transition-colors"
                        >
                          {board.name}
                        </Link>
                        {board.moderators.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Moderated
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600 mb-3">{board.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <span className="flex items-center">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          {board.threadCount} topics
                        </span>
                        <span className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {board.postCount} posts
                        </span>
                      </div>
                    </div>

                    {board.lastPostBy && (
                      <div className="text-right ml-6">
                        <div className="text-sm text-neutral-500 mb-1">
                          {formatLastPost(board.lastPostAt)}
                        </div>
                        <div className="text-sm font-medium text-neutral-600">
                          by {board.lastPostBy}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {categories.reduce((total, cat) => total + cat.boards.length, 0)}
          </div>
          <div className="text-neutral-600">Boards</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {categories.reduce((total, cat) => 
              total + cat.boards.reduce((sum, board) => sum + board.threadCount, 0), 0
            )}
          </div>
          <div className="text-neutral-600">Topics</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {categories.reduce((total, cat) => 
              total + cat.boards.reduce((sum, board) => sum + board.postCount, 0), 0
            )}
          </div>
          <div className="text-neutral-600">Posts</div>
        </div>
      </div>
    </div>
  );
}