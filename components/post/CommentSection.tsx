


import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { useAuth } from '@/App.tsx';
import { CommentWithProfile, CommentInsert } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import { Link } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface CommentSectionProps {
  postId: number;
  onCommentAdded: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('comments').select(`id, user_id, post_id, parent_comment_id, content, created_at, profiles(name, username, photo_url)`).eq('post_id', postId).order('created_at', { ascending: false });
      if (error) console.error('Error fetching comments:', error);
      else if (data) setComments(data as unknown as CommentWithProfile[]);
      setLoading(false);
    };
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setIsPosting(true);
    const payload: CommentInsert = { post_id: postId, user_id: user.id, content: newComment.trim() };
    const { data, error } = await supabase.from('comments').insert(payload).select('*, profiles(name, username, photo_url)').single();
    if (error) {
      alert('Failed to post comment.');
    } else if (data) {
      setComments([data as unknown as CommentWithProfile, ...comments]);
      setNewComment('');
      onCommentAdded();
    }
    setIsPosting(false);
  };
  
  const defaultAvatar = (seed: string | null) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed || 'default'}`;

  return (
    <div className="p-4 border-t-2 border-dashed border-primary-yellow/50 dark:border-primary-yellow/20 bg-accent/5">
      {user && (
        <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-4">
          <img src={user.photo_url || defaultAvatar(user.username)} alt="Your avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-blue" />
          <div className="flex-grow flex items-center rounded-full bg-white dark:bg-dark-bg shadow-inner p-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={1}
              className="flex-grow bg-transparent px-3 py-1 outline-none resize-none text-secondary-purple dark:text-dark-text"
              style={{ height: 'auto', minHeight: '2.5rem' }}
              onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button type="submit" disabled={isPosting || !newComment.trim()} className="p-2 rounded-full bg-accent text-white hover:opacity-80 transition-opacity disabled:bg-gray-400">
              <PaperAirplaneIcon className="h-5 w-5"/>
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-4"><AnimeLoader /></div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {comments.length === 0 && <p className="text-center py-4">No comments yet. Be the first!</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Link to={`/profile/${comment.user_id}`}>
                <img src={comment.profiles?.photo_url || defaultAvatar(comment.profiles?.username)} alt={comment.profiles?.name || 'user'} className="w-10 h-10 rounded-full object-cover border-2 border-accent" />
              </Link>
              <div className="flex-grow">
                <div className="bg-white dark:bg-dark-card rounded-lg p-3 shadow-sm">
                  <Link to={`/profile/${comment.user_id}`} className="font-bold text-sm hover:text-accent">{comment.profiles?.name || comment.profiles?.username}</Link>
                  <p>{comment.content}</p>
                </div>
                 <p className="text-xs text-secondary-purple/70 dark:text-dark-text/70 pl-2 pt-1">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;