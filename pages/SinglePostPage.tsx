
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Post } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import PostCard from '../components/post/PostCard';

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
                    profiles (username, name, photo_url),
                    likes(count),
                    comments(count)
                `)
                .eq('id', postId)
                .single();
            
            if (postError) {
                console.error("Error fetching single post:", postError);
                setError("Could not find this post. It may have been deleted.");
                setLoading(false);
                return;
            }

            if (postData) {
                let isLiked = false;
                if (user) {
                    const { data: likeData, error: likeError } = await supabase
                        .from('likes')
                        .select('id')
                        .eq('post_id', postId)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (likeError) console.error("Error checking like status:", likeError);
                    isLiked = !!likeData;
                }
                
                setPost({ ...(postData as any), is_liked: isLiked });
            } else {
                 setError("Post not found.");
            }
            
            setLoading(false);
        };
        fetchPost();
    }, [postId, user]);

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto">
                {loading && <AnimeLoader />}
                {error && <p className="text-center text-red-500 py-10">{error}</p>}
                {post && (
                    <PostCard 
                        post={post} 
                        isSinglePostView={true}
                        // Dummy functions as updates/deletes are not handled here
                        onPostUpdated={() => {}}
                        onPostDeleted={() => {}}
                    />
                )}
            </div>
        </PageTransition>
    );
};

export default SinglePostPage;
