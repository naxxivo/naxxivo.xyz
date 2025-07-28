import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb, getAvatarUrl, getCoverUrl, getPostImageUrl } from '../services/pocketbase';
import type { User, Post, Follow, Like } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/Spinner';

const ProfileStat: React.FC<{ count: number; label: string }> = ({ count, label }) => (
    <div className="text-center">
        <span className="font-bold text-xl text-text-primary">{count}</span>
        <p className="text-sm text-text-secondary">{label}</p>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
            isActive
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border'
        }`}
    >
        {label}
    </button>
);


export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRecordId, setFollowRecordId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [loadingTabContent, setLoadingTabContent] = useState(false);

  const userId = id || authUser?.id;
  const isOwnProfile = userId === authUser?.id;

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userPromise = pb.collection('users').getOne<User>(userId, { requestKey: null });
      const postsPromise = pb.collection('posts').getFullList<Post>({ filter: `user = "${userId}"`, sort: '-created', requestKey: null });
      const followersPromise = pb.collection('follows').getFullList<Follow>({ filter: `following = "${userId}"`, requestKey: null });
      const followingPromise = pb.collection('follows').getFullList<Follow>({ filter: `follower = "${userId}"`, requestKey: null });

      const [fetchedUser, fetchedPosts, fetchedFollowers, fetchedFollowing] = await Promise.all([userPromise, postsPromise, followersPromise, followingPromise]);
      
      setUser(fetchedUser);
      setPosts(fetchedPosts);
      setPostCount(fetchedPosts.length);
      setFollowerCount(fetchedFollowers.length);
      setFollowingCount(fetchedFollowing.length);

      if (authUser && !isOwnProfile) {
        const followRecord = fetchedFollowers.find(f => f.follower === authUser.id);
        setIsFollowing(!!followRecord);
        setFollowRecordId(followRecord ? followRecord.id : null);
      }

    } catch (err) {
      setError('Could not load user profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, authUser, isOwnProfile]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
        if (activeTab !== 'likes' || !userId) return;

        setLoadingTabContent(true);
        try {
            const likeRecords = await pb.collection('like').getFullList<Like>({
                filter: `user = "${userId}"`,
                sort: '-created',
                requestKey: null,
            });

            if (likeRecords.length === 0) {
                setLikedPosts([]);
                return;
            }

            const postIds = likeRecords.map(like => like.post);
            const postsFilter = postIds.map(id => `id = "${id}"`).join(' || ');
            
            const fetchedLikedPosts = await pb.collection('posts').getFullList<Post>({
                filter: postsFilter,
                expand: 'user',
                requestKey: null,
            });
            
            setLikedPosts(fetchedLikedPosts);

        } catch (error) {
            console.error("Failed to fetch liked posts", error);
            setError("Could not load liked posts.");
        } finally {
            setLoadingTabContent(false);
        }
    };

    fetchLikedPosts();
  }, [activeTab, userId]);
  
  const handleFollowToggle = async () => {
    if (!authUser || !userId || isOwnProfile || followLoading) return;
    setFollowLoading(true);

    const originalIsFollowing = isFollowing;
    const originalFollowerCount = followerCount;

    setIsFollowing(prev => !prev);
    setFollowerCount(prev => originalIsFollowing ? prev - 1 : prev + 1);

    try {
        if (originalIsFollowing) {
            if (followRecordId) {
                await pb.collection('follows').delete(followRecordId, { requestKey: null });
                setFollowRecordId(null);
            }
        } else {
            const newFollow = await pb.collection('follows').create({
                follower: authUser.id,
                following: userId,
            }, { requestKey: null });
            setFollowRecordId(newFollow.id);
            // Create notification
            await pb.collection('notifications').create({
                user: userId,
                source_user: authUser.id,
                type: 'follow',
            }, { requestKey: null });
        }
    } catch (err) {
        setIsFollowing(originalIsFollowing);
        setFollowerCount(originalFollowerCount);
        console.error("Failed to toggle follow", err);
        setError("Something went wrong. Please try again.");
    } finally {
        setFollowLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  if (error && !user) return <div className="text-center text-danger mt-20">{error}</div>;
  if (!user) return <div className="text-center text-text-secondary mt-20">User not found.</div>;

  const usernameDisplay = user.name ? user.name.toLowerCase().replace(/\s+/g, '') : user.id;

  const renderTabContent = () => {
    if(loadingTabContent) return <div className="flex justify-center p-8"><Spinner /></div>;

    let content;
    let emptyMessage;

    if (activeTab === 'posts') {
        content = posts;
        emptyMessage = `${user.name} has not created any posts yet.`;
    } else {
        content = likedPosts;
        emptyMessage = `${user.name} has not liked any posts yet.`;
    }

    if (content.length > 0) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {content.map(post => (
                    <Link key={post.id} to={`/posts/${post.id}`}>
                        <div className="aspect-square bg-secondary group relative">
                            <img src={getPostImageUrl(post)} alt={post.description} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                <p className="text-white text-sm text-center line-clamp-2">{post.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    } else {
        return (
            <div className="bg-surface rounded-b-2xl p-8 text-center">
                <p className="text-text-secondary">{emptyMessage}</p>
            </div>
        );
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-surface rounded-2xl shadow-xl overflow-hidden">
        <div className="h-48 bg-background">
           <img src={getCoverUrl(user)} alt={`${user.name}'s cover photo`} className="w-full h-full object-cover"/>
        </div>
        <div className="p-4 sm:p-8 -mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end space-x-4 sm:space-x-6">
                  <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 sm:border-8 border-surface"
                  />
                  <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{user.name}</h1>
                      <p className="text-md text-text-secondary">@{usernameDisplay}</p>
                  </div>
              </div>
              <div>
                  {isOwnProfile ? (
                      <Link to="/profile/edit" className="px-4 py-2 border border-border text-text-secondary rounded-md hover:bg-border transition-colors">
                          Edit Profile
                      </Link>
                  ) : (
                      <button 
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-6 py-2 rounded-md font-semibold transition-colors group w-32 text-center ${
                              isFollowing 
                              ? 'bg-secondary text-text-primary border border-border hover:bg-danger/20 hover:border-danger hover:text-danger' 
                              : 'bg-primary text-white hover:bg-primary-hover'
                          }`}
                      >
                          <span className={isFollowing ? 'group-hover:hidden' : ''}>
                              {followLoading ? <Spinner size="sm"/> : (isFollowing ? 'Following' : 'Follow')}
                          </span>
                          <span className={isFollowing ? 'hidden group-hover:inline' : 'hidden'}>
                              Unfollow
                          </span>
                      </button>
                  )}
              </div>
          </div>
          
          <div className="flex justify-around items-center border-t border-border py-4 mt-6">
              <ProfileStat count={postCount} label="Posts" />
              <ProfileStat count={followerCount} label="Followers" />
              <ProfileStat count={followingCount} label="Following" />
          </div>

          <div className="mt-8 border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-text-primary mb-2">About</h2>
              <p className="text-text-secondary">
                  {user.bio || 'No biography provided.'}
              </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="border-b border-border flex justify-center">
            <TabButton label="Posts" isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
            <TabButton label="Likes" isActive={activeTab === 'likes'} onClick={() => setActiveTab('likes')} />
        </div>
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>
    </main>
  );
};