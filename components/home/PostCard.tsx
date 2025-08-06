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
    isInitiallyFollowing?: boolean;
    hideFollowButton?: boolean;
}

const getVideoDetails = (url: string): { platform: 'youtube' | 'vimeo' | 'direct'; id: string } | null => {
    if (!url) return null;

    let match;

    // YouTube: covers watch, shorts, youtu.be, and embed links
    match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return { platform: 'youtube', id: match[1] };
    
    // Vimeo: covers vimeo.com/ID and vimeo.com/video/ID
    match = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (match && match[1]) return { platform: 'vimeo', id: match[1] };

    // Direct video file link
    try {
        const path = new URL(url).pathname.toLowerCase();
        if (['.mp4', '.webm', '.ogg', '.mov'].some(ext => path.endsWith(ext))) {
            return { platform: 'direct', id: url };
        }
    } catch (e) {
        // Not a valid URL, will be treated as an image below
    }

    return null;
};


const PostCard: React.FC<PostCardProps> = ({ post, session, onViewProfile, onOpenComments, isInitiallyFollowing = false, hideFollowButton = false }) => {
    const { profiles: profile, caption, content_url, created_at, id: postId, user_id } = post;
    const timeAgo = new Date(created_at).toLocaleDateString();

    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [userHasLiked, setUserHasLiked] = useState(post.likes.some(like => like.user_id === session.user.id));
    const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    
    const commentCount = post.comments[0]?.count ?? 0;
    const isMyPost = user_id === session.user.id;
    
    const videoDetails = content_url ? getVideoDetails(content_url) : null;

    const handleFollowToggle = async () => {
        if (isMyPost || isUpdatingFollow) return;
        
        setIsUpdatingFollow(true);
        const originalFollowStatus = isFollowing;
        setIsFollowing(!originalFollowStatus);

        try {
            if (originalFollowStatus) {
                await supabase.from('follows').delete().match({ follower_id: session.user.id, following_id: user_id });
            } else {
                const newFollow: TablesInsert<'follows'> = { follower_id: session.user.id, following_id: user_id };
                await supabase.from('follows').insert([newFollow] as any);
            }
        } catch (error: any) {
            console.error("Failed to update follow status:", error.message);
            setIsFollowing(originalFollowStatus); // Revert on error
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    const handleLikeToggle = async () => {
        const originalLikeStatus = userHasLiked;
        const originalLikeCount = likeCount;

        setUserHasLiked(!originalLikeStatus);
        setLikeCount(prev => originalLikeStatus ? prev - 1 : prev + 1);

        try {
            if (originalLikeStatus) {
                await supabase.from('likes').delete().match({ user_id: session.user.id, post_id: postId });
            } else {
                const like: TablesInsert<'likes'> = { user_id: session.user.id, post_id: postId };
                await supabase.from('likes').insert([like] as any);
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
                return; // Exit after successful share
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
            className="bg-[var(--theme-card-bg)] rounded-2xl shadow-sm flex flex-col"
        >
            <div className="flex items-center p-4">
                <div className="flex items-center flex-grow">
                    <button onClick={() => onViewProfile(user_id)} className="flex items-center text-left focus:outline-none rounded-full focus:ring-2 focus:ring-[var(--theme-ring)]">
                        <img 
                          src={profile?.photo_url || generateAvatar(profile?.name || profile?.username || user_id)} 
                          alt={profile?.name || ''} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                        <div className="ml-3">
                            <p className="font-bold text-[var(--theme-text)] text-sm">{profile?.name || 'Anonymous'}</p>
                            <p className="text-xs text-[var(--theme-text-secondary)]">{timeAgo}</p>
                        </div>
                    </button>
                    {!isMyPost && !hideFollowButton && (
                        <>
                            <span className="text-gray-400 mx-2 font-bold">·</span>
                             <button
                                onClick={handleFollowToggle}
                                disabled={isUpdatingFollow}
                                className={`font-semibold text-sm transition-colors duration-200 disabled:cursor-not-allowed ${isFollowing ? 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]' : 'text-[var(--theme-primary)] hover:text-[var(--theme-primary-hover)]'}`}
                            >
                                {isUpdatingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </>
                    )}
                </div>
                <button className="ml-auto text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] flex-shrink-0">
                    <OptionsIcon />
                </button>
            </div>

            {content_url && (
                <div className="w-full bg-black aspect-video">
                    {videoDetails?.platform === 'youtube' ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoDetails.id}`}
                            title={`YouTube video player for ${caption || 'post'}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    ) : videoDetails?.platform === 'vimeo' ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://player.vimeo.com/video/${videoDetails.id}`}
                            title={`Vimeo video player for ${caption || 'post'}`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : videoDetails?.platform === 'direct' ? (
                        <video 
                            src={videoDetails.id} 
                            controls 
                            playsInline
                            className="w-full h-full object-contain"
                            preload="metadata"
                        />
                    ) : (
                        <img src={content_url} alt="Post content" className="w-full h-full object-cover" loading="lazy" />
                    )}
                </div>
            )}
            
            <div className="p-4">
                <div className="flex items-center space-x-5 text-[var(--theme-text-secondary)]">
                    <motion.button
                        onClick={handleLikeToggle}
                        className={`flex items-center space-x-2 hover:text-[var(--theme-primary)] transition-colors ${userHasLiked ? 'text-[var(--theme-primary)]' : ''}`}
                        whileTap={{ scale: 0.9 }}
                    >
                         <motion.div initial={false} animate={{ scale: userHasLiked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                            <HeartIcon filled={userHasLiked} />
                        </motion.div>
                        <span className="font-semibold text-sm">{likeCount}</span>
                    </motion.button>
                    <button onClick={onOpenComments} className="flex items-center space-x-2 hover:text-[var(--theme-primary)] transition-colors">
                        <CommentIcon />
                        <span className="font-semibold text-sm">{commentCount}</span>
                    </button>
                     <button onClick={handleShare} className="flex items-center space-x-2 hover:text-[var(--theme-primary)] transition-colors ml-auto">
                        <ShareIcon />
                    </button>
                </div>

                {caption && <p className="mt-3 text-sm text-[var(--theme-text)]">{caption}</p>}
            </div>
        </motion.div>
    );
};

export default PostCard;