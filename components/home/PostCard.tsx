import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { PostWithDetails } from './HomePage';
import { generateAvatar } from '../../utils/helpers';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import { motion } from 'framer-motion';
import Button from '../common/Button';


// --- Types --- //
interface ProfileStub {
    username: string | null;
    name: string | null;
    photo_url: string | null;
}

type CommentWithProfile = Tables<'comments'> & {
    profiles: ProfileStub | null;
};


interface PostCardProps {
    post: PostWithDetails;
    session: Session;
    onViewProfile: (userId: string) => void;
    isInitiallyFollowing: boolean;
    onFollowChange: (targetUserId: string, isFollowing: boolean) => void;
}

// --- Icons --- //
const HeartIcon = ({ filled }: { filled: boolean }) => (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        viewBox="0 0 20 20"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </motion.svg>
);

const CommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);


// --- Content Renderers --- //
const getYouTubeID = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const isImageUrl = (url: string): boolean => {
    return /\.(jpeg|jpg|gif|png|webp)$/.test(url.toLowerCase());
};

const PostContent: React.FC<{ url: string }> = ({ url }) => {
    const youtubeID = getYouTubeID(url);
    
    if (youtubeID) {
        return (
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeID}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded YouTube video"
                    className="w-full h-full"
                ></iframe>
            </div>
        );
    }

    if (isImageUrl(url)) {
        return (
            <div className="rounded-lg overflow-hidden">
                <img src={url} alt="Post content" className="w-full h-auto object-cover" loading="lazy" />
            </div>
        );
    }
    
    return null;
};


// --- Main Card Component --- //
const PostCard: React.FC<PostCardProps> = ({ post, session, onViewProfile, isInitiallyFollowing, onFollowChange }) => {
    const { profiles: profile, caption, content_url, created_at, id: postId, user_id } = post;
    const timeAgo = new Date(created_at).toLocaleString();
    const isMyPost = user_id === session.user.id;

    // --- State --- //
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [userHasLiked, setUserHasLiked] = useState(post.likes.some(like => like.user_id === session.user.id));
    const [commentCount, setCommentCount] = useState(post.comments[0]?.count ?? 0);
    const [comments, setComments] = useState<CommentWithProfile[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

    // Sync following state with parent
    React.useEffect(() => {
        setIsFollowing(isInitiallyFollowing);
    }, [isInitiallyFollowing]);

    // --- Handlers --- //
    const handleLikeToggle = async () => {
        const originalLikeStatus = userHasLiked;
        const originalLikeCount = likeCount;

        // Optimistic UI update
        setUserHasLiked(!originalLikeStatus);
        setLikeCount(prev => originalLikeStatus ? prev - 1 : prev + 1);

        try {
            if (originalLikeStatus) {
                // Unlike
                const { error } = await supabase.from('likes').delete().match({ user_id: session.user.id, post_id: postId });
                if (error) throw error;
            } else {
                // Like
                const { error } = await supabase.from('likes').insert([{ user_id: session.user.id, post_id: postId }]);
                if (error) throw error;
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
            // Revert on error
            setUserHasLiked(originalLikeStatus);
            setLikeCount(originalLikeCount);
        }
    };

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMyPost || isUpdatingFollow) return;

        setIsUpdatingFollow(true);
        const originalFollowStatus = isFollowing;

        // Optimistic update
        setIsFollowing(!originalFollowStatus);
        onFollowChange(user_id, !originalFollowStatus);

        try {
            if (originalFollowStatus) {
                await supabase.from('follows').delete().match({ follower_id: session.user.id, following_id: user_id });
            } else {
                await supabase.from('follows').insert([{ follower_id: session.user.id, following_id: user_id }]);
            }
        } catch (error) {
            console.error("Follow toggle failed", error);
            // Revert on failure
            setIsFollowing(originalFollowStatus);
            onFollowChange(user_id, originalFollowStatus);
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Post by ${profile?.name || 'Anonymous'} on NAXXIVO`,
            text: caption || `Check out this post!`,
            url: window.location.href, // Or a direct link to the post if you have one
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support navigator.share
                alert('Sharing is not supported on this browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleToggleComments = async () => {
        const shouldShow = !showComments;
        setShowComments(shouldShow);

        if (shouldShow && comments.length === 0 && commentCount > 0) {
            setCommentsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('comments')
                    .select('*, profiles(username, name, photo_url)')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                if (data) {
                    setComments(data);
                }

            } catch (error) {
                console.error("Failed to fetch comments:", error);
                setShowComments(false); // Hide on error
            } finally {
                setCommentsLoading(false);
            }
        }
    };
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{ content: newComment, post_id: postId, user_id: session.user.id }])
                .select('*, profiles(username, name, photo_url)')
                .single();
            
            if (error) throw error;

            if (data) {
                setComments(prev => [...prev, data as unknown as CommentWithProfile]);
                setCommentCount(prev => prev + 1);
                setNewComment('');
            }

        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="bg-[#1C1B33] rounded-2xl shadow-lg p-5 flex flex-col"
        >
            {/* Card Header */}
            <div className="flex items-center mb-4 w-full">
                <button onClick={() => onViewProfile(user_id)} className="flex items-center text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        <img 
                          src={profile?.photo_url || generateAvatar(profile?.name || profile?.username || user_id)} 
                          alt={profile?.name || ''} 
                          className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="ml-4 overflow-hidden">
                        <p className="font-bold text-white truncate">{profile?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-400 truncate">@{profile?.username || 'unknown'} · {timeAgo}</p>
                    </div>
                </button>
                {!isMyPost && (
                     <div className="ml-4 w-28 flex-shrink-0">
                        <Button
                            onClick={handleFollowToggle}
                            disabled={isUpdatingFollow}
                            size="small"
                            variant={isFollowing ? 'secondary' : 'primary'}
                        >
                            {isUpdatingFollow ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Caption */}
            {caption && <p className="text-gray-300 mb-4 whitespace-pre-wrap">{caption}</p>}

            {/* Content */}
            {content_url && <div className="mb-4"><PostContent url={content_url} /></div>}

            {/* Actions */}
            <div className="flex items-center space-x-6 text-gray-400 border-t border-gray-700 pt-3">
                <motion.button
                    onClick={handleLikeToggle}
                    className={`flex items-center space-x-2 hover:text-blue-400 transition-colors ${userHasLiked ? 'text-blue-500' : ''}`}
                    whileTap={{ scale: 0.9, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <HeartIcon key={userHasLiked ? 'liked' : 'unliked'} filled={userHasLiked} />
                    <span>{likeCount}</span>
                </motion.button>
                <button onClick={handleToggleComments} className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                    <CommentIcon />
                    <span>{commentCount}</span>
                </button>
                 <button onClick={handleShare} className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                    <ShareIcon />
                    <span>Share</span>
                </button>
            </div>
            
            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    {commentsLoading && <p className="text-gray-400">Loading comments...</p>}
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                         {comments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mt-1">
                                    <img 
                                        src={comment.profiles?.photo_url || generateAvatar(comment.profiles?.name || comment.profiles?.username || comment.user_id)} 
                                        alt={comment.profiles?.name || ''} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">{comment.profiles?.name || 'Anonymous'}</p>
                                    <p className="text-gray-300">{comment.content}</p>
                                </div>
                            </div>
                         ))}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-4">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-grow bg-[#100F1F] border-transparent rounded-full text-white placeholder-gray-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmittingComment}
                        />
                        <button type="submit" className="text-blue-500 font-bold hover:text-blue-400 disabled:text-gray-500" disabled={isSubmittingComment || !newComment.trim()}>
                            {isSubmittingComment ? '...' : 'Post'}
                        </button>
                    </form>
                </div>
            )}
        </motion.div>
    );
};

export default PostCard;