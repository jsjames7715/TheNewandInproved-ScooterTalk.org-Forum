import React from 'react';
import { useParams } from 'react-router-dom';
import { rpcClient } from '../../rpc-client.ts';

export function ForumThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = React.useState<any>(null);
  const [posts, setPosts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (threadId) {
      loadThread();
    }
  }, [threadId]);

  const loadThread = async () => {
    try {
      setIsLoading(true);
      const data = await rpcClient.forum.content.getThread({ threadId: threadId! });
      setThread(data.thread);
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading thread...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-4">
        {thread?.title || 'Thread'}
      </h1>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} className="p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {post.authorUsername?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-semibold text-neutral-800">{post.authorUsername}</div>
                <div className="text-sm text-neutral-500">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-neutral-700">{post.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}