import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Post, PostCardProps, PostRow, PostRowUpdate } from '@/types';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import { HeartIcon as HeartIconSolid, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import CommentSection from '@/components/post/CommentSection';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/anime/VideoPlayer';
import { usePostActions } from '@/components/ui/hooks/usePostActions';
import { useShare } from '@/components/ui/hooks/useShare';
import ShareModal from '@/components/ui/ShareModal';

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted, isSinglePostView = false }) => {
  const { user } = useAuth();
  const { likeCount, isLiked, commentCount, handleLike, onCommentAdded } = usePostActions(post);
  const [showComments, setShowComments] = useState(isSinglePostView);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || '');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { share, isModalOpen, shareData, closeModal } = useShare();

  const isOwner = user?.id === post.user_id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleDelete = async () => {
    if (!isOwner || !onPostDeleted) return;
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) {
        alert('Failed to delete post: ' + error.message);
      } else {
        onPostDeleted(post.id);
      }
    }
  };

  const handleUpdate = async () => {
    if (!isOwner || !onPostUpdated) return;
    const payload: PostRowUpdate = { caption: editedCaption };
    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', post.id)
      .select('id, user_id, caption, content_url, created_at')
      .single();

    if (error) {
      alert('Failed to update post: ' + error.message);
    } else if (data) {
       const updatedPostForState: Post = {
         ...post,
         ...(data as unknown as PostRow),
         caption: editedCaption,
       };
      onPostUpdated(updatedPostForState);
      setIsEditing(false);
      setShowMenu(false);
    }
  };
  
  const handleShare = () => {
    share({
      title: `Check out this post on NAXXIVO!`,
      text: post.caption || `By ${post.profiles?.name || post.profiles?.username}`,
      url: `${window.location.origin}/#/post/${post.id}`
    });
  };

  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${post.profiles?.username || 'default'}`;
  
  const isImage = post.content_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.content_url);
  const isVideo = post.content_url && /youtube\.com|youtu\.be|drive\.google\.com|facebook\.com/i.test(post.content_url);


  return (
    <>
    <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-1 transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/30 dark:hover:shadow-accent/20 will-change-transform">
      <div className="relative transform-style-3d">
        <div className="p-4 flex items-center space-x-3 border-b border-primary-yellow/30 dark:border-primary-yellow/20">
          <Link to={`/profile/${post.user_id}`}>
            <img src={post.profiles?.photo_url || defaultAvatar} alt={post.profiles?.name || 'user'} className="w-12 h-12 rounded-full border-2 border-accent object-cover"/>
          </Link>
          <div className="flex-grow">
            <Link to={`/profile/${post.user_id}`} className="font-bold text-secondary-purple dark:text-dark-text hover:text-accent transition-colors">{post.profiles?.name || post.profiles?.username}</Link>
            <p className="text-xs text-secondary-purple/70 dark:text-dark-text/70">{new Date(post.created_at).toLocaleString()}</p>
          </div>
          {isOwner && !isSinglePostView && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors">
                <EllipsisVerticalIcon className="h-6 w-6" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-dark-bg rounded-lg shadow-2xl z-10 overflow-hidden">
                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-secondary-purple dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-card">
                      <PencilSquareIcon className="h-5 w-5 mr-3"/>Edit
                    </button>
                    <button onClick={handleDelete} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <TrashIcon className="h-5 w-5 mr-3"/>Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {isImage && post.content_url && (
          <img src={post.content_url} alt={post.caption || 'Post image'} className="w-full h-auto object-cover max-h-[60vh]" />
        )}

        {isVideo && !isImage && post.content_url && (
          <VideoPlayer url={post.content_url} className="w-full aspect-video bg-black" />
        )}
        
        {isEditing ? (
          <div className="p-5">
            <textarea value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)} rows={3} className="w-full p-2 border-2 border-accent rounded-lg bg-white dark:bg-dark-bg focus:outline-none"/>
            <div className="flex justify-end space-x-2 mt-2">
              <Button text="Cancel" variant="secondary" onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm"/>
              <Button text="Save" onClick={handleUpdate} className="px-3 py-1 text-sm"/>
            </div>
          </div>
        ) : (
          post.caption && (
            <div className="p-5">
              <div className="relative bg-white dark:bg-dark-bg/50 rounded-lg p-4 shadow-inner">
                <p className="whitespace-pre-wrap">{post.caption}</p>
                <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-dark-bg/50"></div>
              </div>
            </div>
          )
        )}

        <div className="p-4 flex items-center space-x-6 border-t border-primary-yellow/30 dark:border-primary-yellow/20">
          <button onClick={handleLike} className="flex items-center space-x-2 text-secondary-purple/80 dark:text-dark-text/80 hover:text-accent transition-colors group">
            {isLiked ? (
              <HeartIconSolid className="h-7 w-7 text-accent transform-gpu group-hover:scale-110 transition-transform" />
            ) : (
              <HeartIconOutline className="h-7 w-7 transform-gpu group-hover:scale-110 transition-transform" />
            )}
            <span className="font-semibold">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-secondary-purple/80 dark:text-dark-text/80 hover:text-primary-blue transition-colors group">
            <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7 transform-gpu group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{commentCount}</span>
          </button>
           <button onClick={handleShare} className="flex items-center space-x-2 text-secondary-purple/80 dark:text-dark-text/80 hover:text-green-500 transition-colors group">
            <ShareIcon className="h-7 w-7 transform-gpu group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <AnimatePresence>
            {showComments && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                    <CommentSection postId={post.id} onCommentAdded={onCommentAdded} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
    <ShareModal isOpen={isModalOpen} onClose={closeModal} shareData={shareData} />
    </>
  );
};

export default PostCard;