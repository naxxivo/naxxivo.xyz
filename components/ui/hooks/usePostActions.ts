import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/App';
import { Post, Like } from '@/types';
import { useNavigate } from 'react-router-dom';

export const usePostActions = (
    post: Post
) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [likeCount, setLikeCount] = useState(post.likes[0]?.count || 0);
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [commentCount, setCommentCount] = useState(post.comments[0]?.count || 0);

    const handleLike = async () => {
        if (!user) {
            alert('You must be logged in to like a post.');
            navigate('/auth');
            return;
        }

        const currentlyLiked = isLiked;
        // Optimistic update
        setIsLiked(!currentlyLiked);
        setLikeCount(prev => currentlyLiked ? prev - 1 : prev + 1);

        try {
            if (currentlyLiked) {
                const { error } = await supabase.from('likes')
                    .delete()
                    .match({ post_id: post.id, user_id: user.id });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('likes')
                    .insert([{ post_id: post.id, user_id: user.id }]);
                if (error) throw error;
            }
        } catch (error: any) {
            console.error("Error toggling like:", error.message);
            // Revert optimistic update on error
            setIsLiked(currentlyLiked);
            setLikeCount(prev => currentlyLiked ? prev + 1 : prev - 1);
            alert("Failed to update like. Please try again.");
        }
    };
    
    const onCommentAdded = () => {
        setCommentCount(prev => prev + 1);
    };

    return {
        likeCount,
        isLiked,
        commentCount,
        handleLike,
        onCommentAdded,
    };
};