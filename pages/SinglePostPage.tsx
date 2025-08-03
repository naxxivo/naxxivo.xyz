

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/locales/en/pages/services/supabase';
import { Post } from '@/types';
import { useAuth } from '@/App';
import PageTransition from '@/components/ui/PageTransition';
import { AnimeLoader } from '@/components/ui/Loader';
import PostCard from '@/components/post/PostCard';

const SinglePostPage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) {
                setError("Post ID is missing.");
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select(`
                    id, user_id, caption, content_url, created_at,
                    profiles(username, name, photo_url),
                    likes(count),
                    comments(count)
                `)
                .eq('id', postId)
                .single();
            
            if (postError) {
                console.error("Error fetching single post:", postError);
                setError("Could not find this post.");
                setLoading(false);
                return;
            }

            if (!postData) {
                setError("Post not found.");
                setLoading(false);
                return;
            }

            let is_liked = false;
            if (user) {
                const { data: likeData, error: likeError } = await supabase
                    .from('likes')
                    .select('post_id')
                    .eq('user_id', user.id)
                    .eq('post_id', postId)
                    .maybeSingle();
                
                if (likeError) {
                    console.error("Error checking like status:", likeError);
                } else if (likeData) {
                    is_liked = true;
                }
            }
            
            const processedPost: Post = {
                ...(postData as any),
                is_liked,
            };

            setPost(processedPost);
            setLoading(false);
        };

        fetchPost();
    }, [postId, user]);
    
    const handlePostUpdated = (updatedPost: Post) => {
        setPost(updatedPost);
    };

    const handlePostDeleted = () => {
        setPost(null);
        setError("This post has been deleted.");
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <AnimeLoader />
            </div>
        );
    }
    
    if (error || !post) {
        return (
            <PageTransition>
                <p className="text-center text-red-500 py-10">{error || 'Post not found.'}</p>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto">
                 <PostCard 
                    post={post} 
                    isSinglePostView={true}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                 />
            </div>
        </PageTransition>
    );
};

export default SinglePostPage;