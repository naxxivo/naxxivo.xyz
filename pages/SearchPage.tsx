import React, { useState, useEffect, useCallback } from 'react';
import { pb } from '../services/pocketbase';
import type { User, Post } from '../types';
import { UserCard } from '../components/UserCard';
import { PostCard } from '../components/posts/PostCard';
import { Spinner } from '../components/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../hooks/useAuth';

type Tab = 'posts' | 'users';

export const SearchPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesData, setLikesData] = useState<Map<string, { count: number; isLiked: boolean; likeId: string | null; }>>(new Map());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!debouncedSearchTerm) {
        setPosts([]);
        setUsers([]);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'posts') {
        const result = await pb.collection('posts').getFullList<Post>({
          filter: `description ~ "${debouncedSearchTerm}%" || tags ~ "${debouncedSearchTerm}%"`,
          sort: '-created',
          expand: 'user',
          requestKey: null
        });
        setPosts(result);
      } else { // users
        const result = await pb.collection('users').getFullList<User>({
          filter: `name ~ "${debouncedSearchTerm}%"`,
          requestKey: null
        });
        setUsers(result);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Something went wrong with the search.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, activeTab]);

  useEffect(() => {
    search();
  }, [search]);
  
   useEffect(() => {
    const fetchLikesForPosts = async () => {
        if (posts.length === 0 || !authUser) return;

        const postIds = posts.map(p => p.id);
        const filter = postIds.map(id => `post = "${id}"`).join(' || ');
        try {
            const allLikes = await pb.collection('like').getFullList({ filter, requestKey: null });
            const userLikes = allLikes.filter(like => like.user === authUser.id);
            const newLikesData = new Map();
            posts.forEach(post => {
                const likesForPost = allLikes.filter(like => like.post === post.id);
                const userLikeRecord = userLikes.find(like => like.post === post.id);
                newLikesData.set(post.id, {
                    count: likesForPost.length,
                    isLiked: !!userLikeRecord,
                    likeId: userLikeRecord ? userLikeRecord.id : null,
                });
            });
            setLikesData(newLikesData);
        } catch (err) { console.error("Failed to fetch likes:", err); }
    };
    fetchLikesForPosts();
  }, [posts, authUser]);

  const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
    <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-text-secondary hover:bg-border'}`}>
        {label}
    </button>
  );

  return (
      <main className="bg-surface p-6 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-4">Search Naxxivo</h1>
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="search"
            placeholder="Search for posts or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-background border-2 border-border rounded-full shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-center space-x-4 mb-8 border-b border-border pb-4">
            <TabButton tab="posts" label="Posts" />
            <TabButton tab="users" label="Users" />
        </div>

        {loading && <div className="flex justify-center mt-16"><Spinner size="lg" /></div>}
        {error && <div className="text-center text-red-400 mt-16">{error}</div>}
        
        {!loading && !error && (
            <div>
                {activeTab === 'posts' && (
                    posts.length > 0 ? (
                        <div className="space-y-6">
                           {posts.map(post => {
                                const likeInfo = likesData.get(post.id) || { count: 0, isLiked: false, likeId: null };
                                return <PostCard key={post.id} post={post} initialLikes={likeInfo.count} initialIsLiked={likeInfo.isLiked} likeRecordId={likeInfo.likeId} onPostUpdated={search} />
                           })}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary mt-16">
                            {debouncedSearchTerm ? `No posts found for "${debouncedSearchTerm}".` : 'Start typing to search for posts.'}
                        </p>
                    )
                )}
                {activeTab === 'users' && (
                     users.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {users.map((user) => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary mt-16">
                            {debouncedSearchTerm ? `No users found for "${debouncedSearchTerm}".` : 'Start typing to search for users.'}
                        </p>
                    )
                )}
            </div>
        )}
      </main>
  );
};