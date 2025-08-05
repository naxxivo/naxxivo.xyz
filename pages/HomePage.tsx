



import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Post } from '../types';
import PostCard from '../components/post/PostCard';
import { AnimeLoader } from '../components/ui/Loader';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../App';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100
    }
  }
};

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
          id,
          user_id,
          caption,
          content_url,
          created_at,
          likes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        const errorMessage = postsError.message || 'Could not fetch the feed. Please try again later.';
        console.error('Error fetching posts:', postsError.message);
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

      const userIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name, photo_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles for posts:', profilesError.message);
      }

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));
      
      let likedPostIds = new Set<number>();
      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) console.error("Could not fetch user likes", likesError);
        else if(likesData) likedPostIds = new Set((likesData as unknown as {post_id: number}[]).map(l => l.post_id));
      }

      const processedPosts: Post[] = (postsData as any[]).map(p => ({
        ...p,
        profiles: profilesMap.get(p.user_id) || null,
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
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={itemVariants}>
              <PostCard post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
            </motion.div>
          ))}
          {posts.length === 0 && <p className="text-center col-span-full">No posts yet. Be the first to share something!</p>}
        </motion.div>
      )}
    </PageTransition>
  );
};

export default HomePage;