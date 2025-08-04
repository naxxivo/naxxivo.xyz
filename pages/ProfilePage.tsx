
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../services/supabase';
import { Post, Profile } from '../types';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import PostCard from '../components/post/PostCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useShare } from '../hooks/useShare';
import ShareModal from '../components/ui/ShareModal';

const SocialIcon: React.FC<{ href: string | null, children: React.ReactNode }> = ({ href, children }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-yellow transition-transform hover:scale-110">
      {children}
    </a>
  );
};

const ProfilePage: React.FC = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Profile>>({});

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollowStats, setLoadingFollowStats] = useState(true);
  
  const { share, isModalOpen, shareData, closeModal } = useShare();
  
  const isOwnProfile = currentUser?.id === userId;
  
  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile?.username || 'default'}`;
  const defaultCover = 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoadingProfile(true);
      setError(null);

      const { data, error } = await supabase.from('profiles').select('id, username, name, bio, photo_url, cover_url, website_url, youtube_url, facebook_url, address, role, created_at').eq('id', userId).maybeSingle();
      
      if (error) {
        setError("Could not fetch this user's profile due to an error.");
      } else {
        setProfile(data as unknown as Profile | null);
        if (data) setProfileData(data as unknown as Profile);
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!loadingProfile && !profile && isOwnProfile && currentUser) {
      setIsEditing(true);
      setProfileData({
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
      });
    }
  }, [loadingProfile, profile, isOwnProfile, currentUser]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      setLoadingPosts(true);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`id, user_id, caption, content_url, created_at, profiles(username, name, photo_url), likes(count), comments(count)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching user posts:', postsError);
      } else if (postsData) {
        let likedPostIds = new Set<number>();
        if (currentUser) {
           const { data: likesData } = await supabase.from('likes').select('post_id').eq('user_id', currentUser.id);
           if (likesData) likedPostIds = new Set((likesData as unknown as {post_id: number}[]).map(l => l.post_id));
        }
        const processedPosts = (postsData as any[]).map(p => ({
          ...p,
          is_liked: likedPostIds.has(p.id)
        })) as Post[];
        setPosts(processedPosts);
      }
      
      setLoadingPosts(false);
    };
    fetchUserPosts();
  }, [userId, currentUser]);

  useEffect(() => {
    const fetchFollowStats = async () => {
        if (!userId) return;
        setLoadingFollowStats(true);
        
        try {
            const { count: followers, error: followersError } = await supabase
                .from('follows')
                .select('follower_id', { count: 'exact', head: true })
                .eq('following_id', userId);
            if (followersError) throw followersError;
            setFollowerCount(followers || 0);

            const { count: following, error: followingError } = await supabase
                .from('follows')
                .select('follower_id', { count: 'exact', head: true })
                .eq('follower_id', userId);
            if (followingError) throw followingError;
            setFollowingCount(following || 0);

            if (currentUser && currentUser.id !== userId) {
                const { data: followCheck, error: checkError } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', userId)
                    .maybeSingle();
                if (checkError) throw checkError;
                setIsFollowing(!!followCheck);
            }
        } catch (error: any) {
            console.error('Error fetching follow stats:', error.message);
        } finally {
            setLoadingFollowStats(false);
        }
    };

    fetchFollowStats();
  }, [userId, currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOwnProfile || !currentUser) return;
      const { created_at, ...upsertData } = profileData;
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .upsert([{ ...upsertData, id: currentUser.id }])
        .select()
        .single();

      if (error) {
        alert('Error saving profile: ' + error.message);
      } else if (updatedProfile) {
        await refreshUser();
        setProfile(updatedProfile as unknown as Profile);
        setIsEditing(false);
        alert('Profile saved successfully!');
      }
  };

  const handleFollow = async () => {
    if (!currentUser || !userId || isFollowing) return;
    setIsFollowing(true);
    setFollowerCount(prev => prev + 1);
    const { error } = await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: userId }]);
    if (error) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      alert('Failed to follow user: ' + error.message);
      console.error('Error following:', error.message);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !userId || !isFollowing) return;
    setIsFollowing(false);
    setFollowerCount(prev => prev - 1);
    const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: userId });
    if (error) {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      alert('Failed to unfollow user: ' + error.message);
      console.error('Error unfollowing:', error.message);
    }
  };
  
  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleStartConversation = async () => {
    if (!currentUser || !userId || isOwnProfile) return;
    navigate(`/messages/${userId}`);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({...prev, [id]: value}));
  };
  
  const handleShareProfile = () => {
    if (!profile) return;
    share({
      title: `Check out ${profile.name || profile.username}'s profile on NAXXIVO!`,
      text: profile.bio || `See what ${profile.name || profile.username} is sharing.`,
      url: `${window.location.origin}/#/profile/${profile.id}`
    });
  };

  if (loadingProfile) return <AnimeLoader />;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>
  if (!profile && !isOwnProfile) return <p className="text-center py-10">User not found.</p>
  
  const displayProfile = isEditing ? profileData : profile;

  return (
    <PageTransition>
      {isEditing ? (
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-primary-blue/30">
          <h2 className="font-display text-3xl font-bold mb-6">{profile ? "Edit Profile" : "Create Your Profile"}</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input id="name" label="Display Name" value={profileData.name || ''} onChange={handleInputChange} />
              <Input id="username" label="Username" value={profileData.username || ''} onChange={handleInputChange} required disabled/>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                <textarea id="bio" value={profileData.bio || ''} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner" />
              </div>
              <Input id="photo_url" label="Profile Photo URL" value={profileData.photo_url || ''} onChange={handleInputChange} placeholder="https://..." />
              {profileData.photo_url && <div className="pl-2"><img src={profileData.photo_url} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-2 border-accent" onError={(e) => e.currentTarget.style.display='none'}/></div>}
              <Input id="cover_url" label="Cover Photo URL" value={profileData.cover_url || ''} onChange={handleInputChange} placeholder="https://..." />
              {profileData.cover_url && <div className="pl-2"><img src={profileData.cover_url} alt="Cover preview" className="w-full h-32 rounded-lg object-cover border-2 border-accent" onError={(e) => e.currentTarget.style.display='none'}/></div>}
              <Input id="address" label="Address" value={profileData.address || ''} onChange={handleInputChange} />
              <Input id="website_url" label="Website URL" value={profileData.website_url || ''} onChange={handleInputChange} placeholder="https://..." />
              <Input id="youtube_url" label="YouTube URL" value={profileData.youtube_url || ''} onChange={handleInputChange} placeholder="https://..." />
              <Input id="facebook_url" label="Facebook URL" value={profileData.facebook_url || ''} onChange={handleInputChange} placeholder="https://facebook.com/..." />
              <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="secondary" onClick={() => profile ? setIsEditing(false) : navigate('/')}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
              </div>
          </form>
        </div>
      ) : (
        displayProfile && (
          <>
            <div className="relative text-white rounded-3xl shadow-2xl shadow-primary-blue/30 overflow-hidden mb-12">
                <img src={displayProfile.cover_url || defaultCover} alt="Cover" className="w-full h-48 md:h-64 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute top-1/2 left-8 right-8 md:left-12 transform -translate-y-1/4 flex flex-col md:flex-row items-center gap-6">
                     <img src={displayProfile.photo_url || defaultAvatar} alt="User avatar" className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg -mt-16 md:mt-0" />
                    <div className="text-center md:text-left pt-4 md:pt-8">
                        <h1 className="font-display text-4xl font-bold drop-shadow-lg">{displayProfile.name || displayProfile.username}</h1>
                        <p className="font-mono text-lg text-primary-yellow/80">@{displayProfile.username}</p>
                        <div className="mt-4 flex items-center justify-center md:justify-start space-x-6 text-white/90">
                           <p><strong>{posts.length}</strong> <span className="text-sm opacity-80">Posts</span></p>
                           <Link to={`/profile/${userId}/follows`} state={{ defaultTab: 'followers' }} className="hover:underline">
                               <p><strong>{followerCount}</strong> <span className="text-sm opacity-80">Followers</span></p>
                           </Link>
                           <Link to={`/profile/${userId}/follows`} state={{ defaultTab: 'following' }} className="hover:underline">
                               <p><strong>{followingCount}</strong> <span className="text-sm opacity-80">Following</span></p>
                           </Link>
                        </div>
                        <p className="mt-2 text-base opacity-90 max-w-xl">{displayProfile.bio}</p>
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-4">
                    {isOwnProfile ? (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={isFollowing ? handleUnfollow : handleFollow} variant={isFollowing ? 'secondary' : 'primary'}>{isFollowing ? "Unfollow" : "Follow"}</Button>
                        <Button onClick={handleStartConversation} variant="secondary">Message</Button>
                        <Button onClick={handleShareProfile}>Share</Button>
                      </div>
                    )}
                </div>
                 <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    <SocialIcon href={displayProfile.website_url}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></SocialIcon>
                     <SocialIcon href={displayProfile.youtube_url}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></SocialIcon>
                    <SocialIcon href={displayProfile.facebook_url}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg></SocialIcon>
                </div>
            </div>
            <h2 className="font-display text-3xl font-bold mb-6">{isOwnProfile ? "Your Posts" : `${displayProfile.name || displayProfile.username}'s Posts`}</h2>
            {loadingPosts ? <AnimeLoader /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length > 0 ? posts.map(post => (
                  <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
                )) : <p className="col-span-full text-center">{isOwnProfile ? "You haven't posted anything yet!" : "This user hasn't posted anything yet."}</p>}
              </div>
            )}
             <ShareModal isOpen={isModalOpen} onClose={closeModal} shareData={shareData} />
          </>
        )
      )}
    </PageTransition>
  );
};

export default ProfilePage;
