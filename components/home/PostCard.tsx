import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { PostWithDetails } from './HomePage';
import { generateAvatar } from '../../utils/helpers';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import { motion } from 'framer-motion';
import { HeartIcon, CommentIcon, OptionsIcon, ShareIcon } from '../common/AppIcons';

type CommentWithProfile = Tables<'comments'> & {
    profiles: {
        username: string | null;
        name: string | null;
        photo_url: string | null;
    } | null;
};

interface PostCardProps {
    post: PostWithDetails;
    session: Session;
    onViewProfile: (userId: string) => void;
    onOpenComments: () => void;
}

const isVideoUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const path = new URL(url).pathname.toLowerCase();
        // A simple check for common video file extensions
        return ['.mp4', '.webm', '.ogg'].some(ext => path.endsWith(ext));
    } catch (e) {
        // Invalid URL, treat as not a video
        return false;
    }
};

const PostCard: React.FC<PostCardProps> = ({ post, session, onViewProfile, onOpenComments }) => {
    const { profiles: profile, caption, content_url, created_at, id: postId, user_id } = post;
    const timeAgo = new Date(created_at).toLocaleDateString();

    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [userHasLiked, setUserHasLiked] = useState(post.likes.some(like => like.user_id === session.user.id));
    const commentCount = post.comments[0]?.count ?? 0;

    const handleLikeToggle = async () => {
        const originalLikeStatus = userHasLiked;
        const originalLikeCount = likeCount;

        setUserHasLiked(!originalLikeStatus);
        setLikeCount(prev => originalLikeStatus ? prev - 1 : prev + 1);

        try {
            if (originalLikeStatus) {
                await supabase.from('likes').delete().match({ user_id: session.user.id, post_id: postId });
            } else {
                await supabase.from('likes').insert([{ user_id: session.user.id, post_id: postId }]);
            }
        } catch (error) {
            setUserHasLiked(originalLikeStatus);
            setLikeCount(originalLikeCount);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Post from ${profile?.name || 'a user'} on NAXXIVO`,
            text: caption || 'Check out this memory!',
            url: window.location.origin, // Generic link to the app home
        };
        
        // Use Web Share API if available
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return; // Exit after successful native share
            } catch (error: any) {
                 if (error.name === 'AbortError') {
                    return; // User cancelled, do nothing.
                }
                // Fall through to clipboard if native share fails for other reasons
            }
        }

        // Fallback to clipboard
        try {
            const fallbackText = `${shareData.text}\n\nFrom: ${shareData.title}\n${shareData.url}`;
            await navigator.clipboard.writeText(fallbackText);
            alert('Link to post copied to clipboard!');
        } catch (error) {
            console.error('Error sharing post:', error);
            alert('Could not share or copy post. This feature may not be supported on your browser.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="bg-white rounded-2xl shadow-sm flex flex-col"
        >
            <div className="flex items-center p-4">
                <button onClick={() => onViewProfile(user_id)} className="flex items-center text-left focus:outline-none rounded-full focus:ring-2 focus:ring-violet-500">
                    <img 
                      src={profile?.photo_url || generateAvatar(profile?.name || profile?.username || user_id)} 
                      alt={profile?.name || ''} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div className="ml-3">
                        <p className="font-bold text-gray-800 text-sm">{profile?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                </button>
                <button className="ml-auto text-gray-500 hover:text-gray-800">
                    <OptionsIcon />
                </button>
            </div>

            {content_url && (
                <div className="w-full bg-black">
                    {isVideoUrl(content_url) ? (
                        <video 
                            src={content_url} 
                            controls 
                            playsInline
                            className="w-full h-auto max-h-[60vh] object-contain"
                            preload="metadata"
                        />
                    ) : (
                        <img src={content_url} alt="Post content" className="w-full h-auto object-cover max-h-[60vh]" loading="lazy" />
                    )}
                </div>
            )}
            
            <div className="p-4">
                <div className="flex items-center space-x-5 text-gray-600">
                    <motion.button
                        onClick={handleLikeToggle}
                        className={`flex items-center space-x-2 hover:text-violet-500 transition-colors ${userHasLiked ? 'text-violet-500' : ''}`}
                        whileTap={{ scale: 0.9 }}
                    >
                         <motion.div initial={false} animate={{ scale: userHasLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                            <HeartIcon filled={userHasLiked} />
                        </motion.div>
                        <span className="font-semibold text-sm">{likeCount}</span>
                    </motion.button>
                    <button onClick={onOpenComments} className="flex items-center space-x-2 hover:text-violet-500 transition-colors">
                        <CommentIcon />
                        <span className="font-semibold text-sm">{commentCount}</span>
                    </button>
                     <button onClick={handleShare} className="flex items-center space-x-2 hover:text-violet-500 transition-colors ml-auto">
                        <ShareIcon />
                    </button>
                </div>

                {caption && <p className="mt-3 text-sm text-gray-700">{caption}</p>}
            </div>
        </motion.div>
    );
};

export default PostCard;