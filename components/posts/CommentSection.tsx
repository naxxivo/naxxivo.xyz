import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pb, getAvatarUrl } from '../../services/pocketbase';
import { useAuth } from '../../hooks/useAuth';
import type { Comment } from '../../types';
import { Spinner } from '../Spinner';
import { SendIcon } from '../icons/SendIcon';

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, postAuthorId }) => {
  const { user: authUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const resultList = await pb.collection('comments').getFullList<Comment>({
        filter: `post = "${postId}"`,
        sort: '-created',
        expand: 'user',
        requestKey: null,
      });
      setComments(resultList);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authUser) return;

    setIsPosting(true);
    try {
      await pb.collection('comments').create({
        content: newComment,
        post: postId,
        user: authUser.id,
      }, { requestKey: null });
      setNewComment('');
      
      // Create notification if not commenting on own post
      if (postAuthorId !== authUser.id) {
          await pb.collection('notifications').create({
              user: postAuthorId,
              source_user: authUser.id,
              post: postId,
              type: 'comment',
          }, { requestKey: null });
      }

      await fetchComments(); // Refetch comments to show the new one
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
        {authUser && <img src={getAvatarUrl(authUser)} alt="your avatar" className="w-10 h-10 rounded-full" />}
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isPosting}
        />
        <button type="submit" className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover disabled:bg-opacity-50" disabled={isPosting}>
            {isPosting ? <Spinner size="sm"/> : <SendIcon className="w-5 h-5"/>}
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : comments.length > 0 ? (
          comments.map(comment => {
            // Guard clause to prevent crash if user data is missing
            if (!comment.expand?.user) {
                return null;
            }
            const author = comment.expand.user;
            return (
                <div key={comment.id} className="flex items-start space-x-3">
                    <Link to={`/profile/${author.id}`}>
                        <img src={getAvatarUrl(author)} alt={author.name} className="w-10 h-10 rounded-full"/>
                    </Link>
                    <div className="bg-background rounded-lg p-3 flex-1">
                        <p>
                            <Link to={`/profile/${author.id}`} className="font-semibold text-text-primary hover:underline">{author.name}</Link>
                            <span className="text-text-secondary text-sm ml-2">{new Date(comment.created).toLocaleDateString()}</span>
                        </p>
                        <p className="text-text-secondary">{comment.content}</p>
                    </div>
                </div>
            );
          })
        ) : (
          <p className="text-center text-text-secondary py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};