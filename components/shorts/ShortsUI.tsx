
import React, { useState } from 'react';
import { Post } from '../../types';
import { Link } from 'react-router-dom';
import { HeartIcon as HeartIconSolid, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { usePostActions } from '../../hooks/usePostActions';
import { motion } from 'framer-motion';

interface ShortsUIProps {
    post: Post;
}

const ShortsUI: React.FC<ShortsUIProps> = ({ post }) => {
    const { likeCount, isLiked, commentCount, handleLike } = usePostActions(post);
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${post.profiles?.username || 'default'}`;

    return (
        <>
            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                    <Link to={`/profile/${post.user_id}`}>
                        <img 
                            src={post.profiles?.photo_url || defaultAvatar} 
                            alt={post.profiles?.name || ''} 
                            className="w-10 h-10 rounded-full border-2 border-white"
                        />
                    </Link>
                    <Link to={`/profile/${post.user_id}`}>
                        <p className="font-bold text-white drop-shadow-md hover:underline">
                            {post.profiles?.name || post.profiles?.username}
                        </p>
                    </Link>
                </div>
                {post.caption && <p className="text-white text-sm drop-shadow">{post.caption}</p>}
            </div>

            {/* Side Actions */}
            <div className="absolute bottom-24 right-2 flex flex-col items-center gap-6 text-white">
                 <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className="flex flex-col items-center gap-1">
                    {isLiked ? (
                         <HeartIconSolid className="w-8 h-8 text-accent drop-shadow-lg" />
                    ) : (
                         <HeartIconOutline className="w-8 h-8 drop-shadow-lg" />
                    )}
                   
                    <span className="text-sm font-semibold drop-shadow">{likeCount}</span>
                </motion.button>

                <button className="flex flex-col items-center gap-1">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 drop-shadow-lg" />
                    <span className="text-sm font-semibold drop-shadow">{commentCount}</span>
                </button>
            </div>
        </>
    );
};

export default ShortsUI;
