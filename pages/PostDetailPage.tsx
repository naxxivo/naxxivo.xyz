import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { PostCard } from '../components/posts/PostCard';
import { CommentSection } from '../components/posts/CommentSection';
import { pb } from '../services/pocketbase';
import type { Post, Like } from '../types';
import { useAuth } from '../hooks/useAuth';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostAndLikes = useCallback(async () => {
    if (!id) {
      setError("Post not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch post and likes in parallel
      const postPromise = pb.collection('posts').getOne<Post>(id, { expand: 'user', requestKey: null });
      const likesPromise = pb.collection('like').getFullList<Like>({
        filter: `post = "${id}"`,
        requestKey: null
      });

      const [fetchedPost, fetchedLikes] = await Promise.all([postPromise, likesPromise]);
      
      setPost(fetchedPost);
      setLikesCount(fetchedLikes.length);

      if (authUser) {
        const userLike = fetchedLikes.find(like => like.user === authUser.id);
        setIsLiked(!!userLike);
        setLikeId(userLike ? userLike.id : null);
      }

    } catch (err) {
      console.error("Failed to fetch post details:", err);
      setError("Could not load the post.");
    } finally {
      setLoading(false);
    }
  }, [id, authUser]);

  useEffect(() => {
    fetchPostAndLikes();
  }, [fetchPostAndLikes]);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  }

  if (error || !post) {
    return <div className="text-center text-danger mt-20">{error || 'Post not found.'}</div>;
  }

  return (
    <main className="space-y-6">
        <PostCard 
            post={post} 
            initialLikes={likesCount} 
            initialIsLiked={isLiked}
            likeRecordId={likeId}
            onPostUpdated={fetchPostAndLikes}
        />
        <div className="bg-surface rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Comments</h2>
            <CommentSection postId={post.id} postAuthorId={post.user} />
        </div>
    </main>
  );
};