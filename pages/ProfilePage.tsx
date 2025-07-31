
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../services/supabase';
import { Post, Profile } from '../types';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import PostCard from '../components/post/PostCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
  
  const isOwnProfile = currentUser?.id === userId;
  
  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile?.username || 'default'}`;
  const defaultCover = 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoadingProfile(true);
      setError(null);

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (error) {
        setError("Could not fetch this user's profile due to an error.");
      } else {
        setProfile(data);
        if (data) setProfileData(data);
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
      const { data, error } = await supabase.from('posts').select(`*, profiles(username, name, photo_url), likes(count), comments(count)`).eq('user_id', userId).order('created_at', { ascending: false });
      if (error) console.error('Error fetching user posts:', error);
      else setPosts((data as any[]) || []);
      setLoadingPosts(false);
    };
    fetchUserPosts();
  }, [userId]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOwnProfile || !currentUser) return;
      const { created_at, ...upsertData } = profileData;
      const { data: updatedProfile, error } = await supabase.from('profiles').upsert([{ ...upsertData, id: currentUser.id }] as any).select().single();
      if (error) {
        alert('Error saving profile: ' + error.message);
      } else if (updatedProfile) {
        await refreshUser();
        setProfile(updatedProfile as Profile);
        setIsEditing(false);
        alert('Profile saved successfully!');
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

  if (loadingProfile) return <AnimeLoader />;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>
  if (!profile && !isOwnProfile) return <p className="text-center py-10">User not found.</p>
  
  const displayProfile = isEditing ? profileData : profile;

  return (
    <PageTransition>
      {isEditing ? (
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-primary-blue/30">
          <h2 className="font-display text-3xl font-bold mb-6">{profile ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
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
                  <Button type="button" text="Cancel" variant="secondary" onClick={() => profile ? setIsEditing(false) : navigate('/')} />
                  <Button type="submit" text="Save Changes" />
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
                        <p className="mt-2 text-base opacity-90 max-w-xl">{displayProfile.bio}</p>
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-4">
                    {isOwnProfile ? (
                      <Button text="Edit Profile" onClick={() => setIsEditing(true)} />
                    ) : (
                      <Button text="Message" onClick={handleStartConversation} variant="secondary" />
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
          </>
        )
      )}
    </PageTransition>
  );
};

export default ProfilePage;
