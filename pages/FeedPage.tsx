import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '../components/Spinner';
import { PostCard } from '../components/posts/PostCard';
import { pb } from '../services/pocketbase';
import type { Post, Like } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export const FeedPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesData, setLikesData] = useState<Map<string, { count: number; isLiked: boolean; likeId: string | null; }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const resultList = await pb.collection('posts').getList<Post>(pageNum, 10, {
        sort: '-created',
        expand: 'user',
        requestKey: null
      });
      setPosts(prev => pageNum === 1 ? resultList.items : [...prev, ...resultList.items]);
      setTotalPages(resultList.totalPages);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Could not load the feed. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLikesForPosts = useCallback(async (currentPosts: Post[]) => {
    if (currentPosts.length === 0 || !authUser) return;

    const postIds = currentPosts.map(p => p.id);
    const filter = postIds.map(id => `post = "${id}"`).join(' || ');

    try {
      const allLikes = await pb.collection('like').getFullList<Like>({ filter, requestKey: null });
      const userLikes = allLikes.filter(like => like.user === authUser.id);
      
      const newLikesData = new Map(likesData);

      currentPosts.forEach(post => {
        const likesForPost = allLikes.filter(like => like.post === post.id);
        const userLikeRecord = userLikes.find(like => like.post === post.id);
        newLikesData.set(post.id, {
          count: likesForPost.length,
          isLiked: !!userLikeRecord,
          likeId: userLikeRecord ? userLikeRecord.id : null,
        });
      });
      
      setLikesData(newLikesData);

    } catch (err) {
      console.error("Failed to fetch likes:", err);
    }
  }, [authUser, likesData]);
  
  // Initial fetch
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Fetch likes when posts change
  useEffect(() => {
    if (posts.length > 0) {
      fetchLikesForPosts(posts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);


  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 200 || loading || page >= totalPages) {
      return;
    }
    setPage(prevPage => prevPage + 1);
  }, [loading, page, totalPages]);

  useEffect(() => {
    if(page > 1) {
        fetchPosts(page);
    }
  }, [page, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
      <main className="space-y-6">
        {posts.map(post => {
          const likeInfo = likesData.get(post.id) || { count: 0, isLiked: false, likeId: null };
          return (
            <PostCard 
              key={post.id} 
              post={post}
              initialLikes={likeInfo.count}
              initialIsLiked={likeInfo.isLiked}
              likeRecordId={likeInfo.likeId}
              onPostUpdated={() => fetchLikesForPosts([post])}
            />
          )
        })}

        {loading && <div className="flex justify-center py-8"><Spinner size="md" /></div>}
        {error && <div className="text-center text-red-400 py-8">{error}</div>}
        {!loading && page >= totalPages && posts.length > 0 && (
          <div className="text-center text-text-secondary py-8">You've reached the end!</div>
        )}
        {!loading && posts.length === 0 && !error && (
            <div className="text-center text-text-secondary py-8 bg-surface rounded-lg">
                <h2 className="text-2xl font-bold text-text-primary">Welcome to Naxxivo!</h2>
                <p className="mt-2">The feed is empty. Follow some users or be the first to post!</p>
                 <Link to="/create-post" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                    Create Post
                </Link>
            </div>
        )}
      </main>
  );
};