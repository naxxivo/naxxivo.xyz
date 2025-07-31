
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Post } from '../types';
import PostCard from '../components/post/PostCard';
import { AnimeLoader } from '../components/ui/Loader';
import PageTransition from '../components/ui/PageTransition';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            name,
            photo_url
          ),
          likes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        const errorMessage = error.message || 'Could not fetch the feed. Please try again later.';
        console.error('Error fetching posts:', error);
        setError(errorMessage);
        setPosts([]);
      } else {
        setPosts((data as any[]) || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <PageTransition>
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2 transition-all duration-300">
          Welcome to NAXXIVO
        </h1>
        <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">The freshest content from our amazing community!</p>
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
          ))}
          {posts.length === 0 && <p className="text-center col-span-full">No posts yet. Be the first to share something!</p>}
        </div>
      )}
    </PageTransition>
  );
};

export default HomePage;