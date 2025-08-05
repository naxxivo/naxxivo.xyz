
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Post } from '../types';
import PostCard from '../components/post/PostCard';
import { AnimeLoader } from '../components/ui/Loader';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../App';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const { data: postsData, error: postsError } = await supabase
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

      if (postsError) {
        const errorMessage = postsError.message || 'Could not fetch the feed. Please try again later.';
        console.error('Error fetching posts:', postsError);
        setError(errorMessage);
        setPosts([]);
        setLoading(false);
        return;
      }
      
      if (!postsData) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      let likedPostIds = new Set<number>();
      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) console.error("Could not fetch user likes", likesError);
        else if(likesData) likedPostIds = new Set((likesData as {post_id: number}[]).map(l => l.post_id));
      }

      const processedPosts: Post[] = (postsData as any[]).map(p => ({
        ...p,
        is_liked: likedPostIds.has(p.id)
      }));
      
      setPosts(processedPosts);
      setLoading(false);
    };

    fetchPosts();
  }, [user]);

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
