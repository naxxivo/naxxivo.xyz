
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Post, Like, PostCardProps, Database } from '../../types';
import { useAuth } from '../../App';
import { supabase } from '../../services/supabase';
import { HeartIcon as HeartIconSolid, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import CommentSection from './CommentSection';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likes[0]?.count || 0);
  const [commentCount, setCommentCount] = useState(post.comments[0]?.count || 0);
  const [userLike, setUserLike] = useState<Like | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || '');
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchUserLike = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('likes').select('*').eq('post_id', post.id).eq('user_id', user.id).maybeSingle();
      if (error) {
        console.error('Error fetching user like:', error);
        setUserLike(null);
      } else {
        setUserLike(data);
      }
    };
    fetchUserLike();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) {
      alert('You must be logged in to like a post.');
      return;
    }
    if (userLike) {
      const { error } = await supabase.from('likes').delete().match({ id: userLike.id });
      if (!error) {
        setLikeCount(prev => prev - 1);
        setUserLike(null);
      }
    } else {
      const { data, error } = await supabase.from('likes').insert([{ post_id: post.id, user_id: user.id }] as any).select().single();
      if (!error && data) {
        setLikeCount(prev => prev + 1);
        setUserLike(data as Like);
      } else if (error) {
        console.error('Error liking post:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
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
    if (!isOwner) return;
    const { data, error } = await supabase.from('posts').update({ caption: editedCaption } as any).eq('id', post.id).select('*, profiles (username, name, photo_url), likes(count), comments(count)').single();
    if (error) {
      alert('Failed to update post: ' + error.message);
    } else if (data) {
      onPostUpdated(data as unknown as Post);
      setIsEditing(false);
      setShowMenu(false);
    }
  };

  const onCommentAdded = () => setCommentCount(prev => prev + 1);
  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${post.profiles?.username || 'default'}`;
  const isImage = post.content_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.content_url);

  return (
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
          {isOwner && (
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
          <img src={post.content_url} alt={post.caption || 'Post image'} className="w-full h-auto object-cover max-h-96" />
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
            {userLike ? (
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
  );
};

export default PostCard;
