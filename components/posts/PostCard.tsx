import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { getAvatarUrl, getPostImageUrl, getPostVideoUrl, pb } from '../../services/pocketbase';
import { useAuth } from '../../hooks/useAuth';
import { HeartIcon } from '../icons/HeartIcon';
import { CommentIcon } from '../icons/CommentIcon';

interface PostCardProps {
  post: Post;
  initialLikes: number;
  initialIsLiked: boolean;
  likeRecordId: string | null;
  onPostUpdated: () => void;
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}

export const PostCard: React.FC<PostCardProps> = ({ post, initialLikes, initialIsLiked, likeRecordId, onPostUpdated }) => {
  const { user: authUser } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [currentLikeId, setCurrentLikeId] = useState<string | null>(likeRecordId);

  const handleLikeToggle = async () => {
    if (!authUser) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const previousLikeId = currentLikeId;

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      if (isLiked) {
        // We are unliking
        if (currentLikeId) {
            await pb.collection('like').delete(currentLikeId, { requestKey: null });
            setCurrentLikeId(null);
        }
      } else {
        // We are liking
        const newLike = await pb.collection('like').create({ user: authUser.id, post: post.id }, { requestKey: null });
        setCurrentLikeId(newLike.id);
        
        // Create notification if not liking own post
        if (post.user !== authUser.id) {
          await pb.collection('notifications').create({
            user: post.user,
            source_user: authUser.id,
            post: post.id,
            type: 'like'
          }, { requestKey: null });
        }
      }
      onPostUpdated(); // Notify parent to refresh like data
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      setCurrentLikeId(previousLikeId);
    }
  };


  if (!post.expand?.user) {
    return null; // Or a loading/error state
  }
  const author = post.expand.user;

  const postVideoUrl = getPostVideoUrl(post);
  const postImageUrl = getPostImageUrl(post);

  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 flex items-center space-x-4">
        <Link to={`/profile/${author.id}`}>
          <img src={getAvatarUrl(author)} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
        </Link>
        <div>
          <Link to={`/profile/${author.id}`} className="font-bold text-text-primary hover:underline">{author.name}</Link>
          <p className="text-sm text-text-secondary">{timeSince(post.created)}</p>
        </div>
      </div>
      
      {post.description && <p className="px-4 pb-4 text-text-primary">{post.description}</p>}
      
      {(postVideoUrl || post.videox || (post.image && post.image.length > 0)) && (
          <Link to={`/posts/${post.id}`}>
              <div className="aspect-video bg-background flex items-center justify-center">
                  {postVideoUrl || post.videox ? (
                      <video
                          src={postVideoUrl || post.videox}
                          controls
                          className="w-full h-full object-contain"
                      >
                          Your browser does not support the video tag.
                      </video>
                  ) : (
                      <img src={postImageUrl} alt={post.description} className="w-full h-full object-contain" />
                  )}
              </div>
          </Link>
      )}


      <div className="p-4 flex justify-between items-center text-text-secondary">
        <div className="flex space-x-6">
          <button onClick={handleLikeToggle} className="flex items-center space-x-2 hover:text-primary transition-colors">
            <HeartIcon className={`w-6 h-6 ${isLiked ? 'text-danger fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <Link to={`/posts/${post.id}`} className="flex items-center space-x-2 hover:text-primary transition-colors">
            <CommentIcon className="w-6 h-6" />
            {/* You would fetch and display comment count similarly to likes */}
            {/* <span>{post.comments_count || 0}</span> */}
          </Link>
        </div>
      </div>
    </div>
  );
};