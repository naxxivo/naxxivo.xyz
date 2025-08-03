
import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { Post } from '@/types.ts';
import PostCard from '@/components/post/PostCard.tsx';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import PageTransition from '@/components/ui/PageTransition.tsx';
import { useAuth } from '@/App.tsx';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
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
      
      let likedPostIds = new Set<number>();
      if (user && postsData) {
          const postIds = postsData.map(p => p.id);
          const { data: likesData, error: likesError } = await supabase
              .from('likes')
              .select('post_id')
              .eq('user_id', user.id)
              .in('post_id', postIds);

          if (likesError) {
              console.error("Error fetching likes for feed:", likesError);
          } else if (likesData) {
              likedPostIds = new Set(likesData.map(l => l.post_id));
          }
      }

      if (postsData) {
          const processedPosts: Post[] = postsData.map((p: any) => ({
              ...p,
              is_liked: likedPostIds.has(p.id)
          }));
          setPosts(processedPosts);
      } else {
          setPosts([]);
      }
      setError(null);
      setLoading(false);
    };

    fetchPosts();
  }, [user]);
  
  const onPostUpdated = (updatedPost: Post) => {
    setPosts(currentPosts => currentPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };
  
  const onPostDeleted = (postId: number) => {
    setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <AnimeLoader text="Loading feed... お楽しみに！" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <PageTransition>
      <motion.div
        className="space-y-6 max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.length > 0 ? (
          posts.map(post => (
            <motion.div key={post.id} variants={itemVariants}>
              <PostCard post={post} onPostUpdated={onPostUpdated} onPostDeleted={onPostDeleted} />
            </motion.div>
          ))
        ) : (
          <p className="text-center py-10">It's quiet in here... be the first to post!</p>
        )}
      </motion.div>
    </PageTransition>
  );
};

export default HomePage;
