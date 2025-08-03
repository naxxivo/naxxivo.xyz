
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/App.tsx';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import { Post, Profile, ProfileInsert, FollowInsert, UserSite, ProfileUpdate } from '@/types.ts';
import PageTransition from '@/components/ui/PageTransition.tsx';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import PostCard from '@/components/post/PostCard.tsx';
import Button from '@/components/ui/Button.tsx';
import Input from '@/components/ui/Input.tsx';
import { useShare } from '@/components/ui/hooks/useShare.ts';
import ShareModal from '@/components/ui/ShareModal.tsx';
import { Squares2X2Icon, ShareIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const SocialIcon: React.FC<{ href: string | null, children: React.ReactNode }> = ({ href, children }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-yellow transition-transform hover:scale-110">
      {children}
    </a>
  );
};

export const ProfilePage: React.FC = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userSite, setUserSite] = useState<UserSite | null>(null);
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
    const fetchFollowStatsAndSite = async () => {
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

            const { data: siteData, error: siteError } = await supabase
                .from('user_sites')
                .select('*')
                .eq('user_id', userId)
                .eq('published', true)
                .maybeSingle();
            if (siteError) throw siteError;
            setUserSite(siteData as UserSite | null);


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

    fetchFollowStatsAndSite();
  }, [userId, currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOwnProfile || !currentUser || !profileData.username) return;
      
      const payload: ProfileUpdate = {
        username: profileData.username,
        name: profileData.name,
        bio: profileData.bio,
        photo_url: profileData.photo_url,
        cover_url: profileData.cover_url,
        website_url: profileData.website_url,
        youtube_url: profileData.youtube_url,
        facebook_url: profileData.facebook_url,
        address: profileData.address,
      };

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
          setError(error.message);
      } else if (updatedProfile) {
          setProfile(updatedProfile as Profile);
          setProfileData(updatedProfile as Profile);
          setIsEditing(false);
          await refreshUser(); // Refresh user context
          alert('Profile updated successfully!');
      }
  };

  const handleFollowToggle = async () => {
    if (isOwnProfile || !currentUser) return;
    setIsFollowing(current => !current); // Optimistic update
    setFollowerCount(current => isFollowing ? current - 1 : current + 1);

    try {
      if (isFollowing) {
        const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: userId });
        if (error) throw error;
      } else {
        const payload: FollowInsert = { follower_id: currentUser.id, following_id: userId! };
        const { error } = await supabase.from('follows').insert(payload);
        if (error) throw error;
      }
    } catch(err: any) {
        console.error("Failed to toggle follow:", err.message);
        setIsFollowing(current => !current); // Revert on error
        setFollowerCount(current => isFollowing ? current + 1 : current - 1);
        alert('Failed to follow/unfollow user.');
    }
  };
  
  const handleShareProfile = () => {
    if (!profile) return;
    share({
        title: `Check out ${profile.name || profile.username}'s profile on NAXXIVO!`,
        text: profile.bio || 'A cool user on NAXXIVO.',
        url: window.location.href,
    });
  }

  if (loadingProfile) return <AnimeLoader text="Loading profile..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  if (!profile && !isEditing) {
      return (
          <PageTransition>
              <div className="text-center">
                  <h1 className="font-display text-4xl">Profile Not Found</h1>
                  <p className="mt-4">This user may not exist or has not set up their profile yet.</p>
              </div>
          </PageTransition>
      );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="relative">
                <img src={profileData.cover_url || profile?.cover_url || defaultCover} alt="Cover" className="w-full h-48 md:h-64 object-cover" />
                <img src={profileData.photo_url || profile?.photo_url || defaultAvatar} alt="Avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-dark-card object-cover absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="pt-20 pb-6 px-6 text-center">
                <h1 className="text-3xl font-bold">{profileData.name || profile?.name || 'New User'}</h1>
                <p className="text-secondary-purple/80 dark:text-dark-text/80">@{profileData.username || profile?.username}</p>
                <p className="max-w-lg mx-auto my-4 text-sm">{profileData.bio || profile?.bio}</p>

                <div className="flex justify-center items-center space-x-6 my-4">
                    <Link to={`/profile/${userId}/follows`} state={{ defaultTab: 'followers' }} className="text-center">
                        <span className="font-bold block text-lg">{followerCount}</span>
                        <span className="text-sm text-gray-500">Followers</span>
                    </Link>
                     <Link to={`/profile/${userId}/follows`} state={{ defaultTab: 'following' }} className="text-center">
                        <span className="font-bold block text-lg">{followingCount}</span>
                        <span className="text-sm text-gray-500">Following</span>
                    </Link>
                </div>

                <div className="flex justify-center flex-wrap gap-4 mt-4">
                    {isOwnProfile ? (
                        <Button onClick={() => setIsEditing(true)}><PencilIcon className="h-5 w-5 mr-2" /> Edit Profile</Button>
                    ) : (
                        <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'primary'}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                    {userSite && (
                         <a href={`/site/${profile?.username}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary"><Squares2X2Icon className="h-5 w-5 mr-2" /> View Site</Button>
                         </a>
                    )}
                    <Button variant="secondary" onClick={handleShareProfile}><ShareIcon className="h-5 w-5 mr-2" /> Share</Button>
                </div>
            </div>
        </div>
        
        {/* Edit Form Modal */}
        {isEditing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <Input id="username" label="Username" value={profileData.username || ''} onChange={(e) => setProfileData(p => ({...p, username: e.target.value}))} required />
                        <Input id="name" label="Display Name" value={profileData.name || ''} onChange={(e) => setProfileData(p => ({...p, name: e.target.value}))} />
                        <div>
                            <label htmlFor="bio">Bio</label>
                            <textarea id="bio" value={profileData.bio || ''} onChange={(e) => setProfileData(p => ({...p, bio: e.target.value}))} className="w-full mt-1 p-2 border rounded-md dark:bg-dark-bg" rows={3}></textarea>
                        </div>
                        <Input id="photo_url" label="Photo URL" value={profileData.photo_url || ''} onChange={(e) => setProfileData(p => ({...p, photo_url: e.target.value}))} />
                        <Input id="cover_url" label="Cover URL" value={profileData.cover_url || ''} onChange={(e) => setProfileData(p => ({...p, cover_url: e.target.value}))} />
                        <div className="flex gap-4">
                          <Button type="submit" className="w-full"><CheckIcon className="h-5 w-5 mr-2" /> Save Changes</Button>
                          <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="w-full"><XMarkIcon className="h-5 w-5 mr-2" /> Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* User Posts */}
        <div className="space-y-6">
            {loadingPosts ? (
                <AnimeLoader />
            ) : posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
                <div className="text-center py-10 bg-white/60 dark:bg-dark-card/70 rounded-lg">
                    <h3 className="text-xl font-semibold">No Posts Yet</h3>
                    <p className="text-gray-500">This user hasn't shared anything.</p>
                </div>
            )}
        </div>
      </div>
      <ShareModal isOpen={isModalOpen} onClose={closeModal} shareData={shareData} />
    </PageTransition>
  );
};
