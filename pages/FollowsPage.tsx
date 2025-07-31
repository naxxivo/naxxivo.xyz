
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Profile } from '../types';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';

type FollowUser = Profile & { is_following: boolean };

const UserCard: React.FC<{
  profile: FollowUser;
  isCurrentUser: boolean;
  onFollowToggle: (profileId: string, currentlyFollowing: boolean) => void;
}> = ({ profile, isCurrentUser, onFollowToggle }) => {
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile.username || 'default'}`;

    return (
        <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 transition-all duration-300 ease-out flex items-center space-x-4">
            <Link to={`/profile/${profile.id}`}>
                <img 
                    src={profile.photo_url || defaultAvatar} 
                    alt={profile.name || 'user'} 
                    className="w-16 h-16 rounded-full border-4 border-primary-blue object-cover"
                />
            </Link>
            <div className="flex-grow">
              <Link to={`/profile/${profile.id}`} className="font-bold text-lg text-secondary-purple dark:text-dark-text hover:text-accent transition-colors break-words">
                  {profile.name || profile.username}
              </Link>
              <p className="text-sm text-secondary-purple/70 dark:text-dark-text/70">@{profile.username}</p>
            </div>
            {!isCurrentUser && (
              <Button
                text={profile.is_following ? 'Unfollow' : 'Follow'}
                onClick={() => onFollowToggle(profile.id, profile.is_following)}
                variant={profile.is_following ? 'secondary' : 'primary'}
                className="px-4 py-1 text-sm !min-w-[100px]"
              />
            )}
        </div>
    );
};

const FollowsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { userId } = useParams<{ userId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [userList, setUserList] = useState<FollowUser[]>([]);
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(location.state?.defaultTab || 'followers');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFollows = useCallback(async () => {
        if (!userId || !currentUser) return;
        setLoading(true);
        setError(null);
        setUserList([]);

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw new Error("Could not load user's profile.");
            setProfile(profileData as Profile);
            
            const isFollowersTab = activeTab === 'followers';
            const queryTable = 'follows';
            const matchColumn = isFollowersTab ? 'following_id' : 'follower_id';
            const selectProfile = isFollowersTab ? 'profiles:profiles!follows_follower_id_fkey(*)' : 'profiles:profiles!follows_following_id_fkey(*)';

            const { data: followData, error: followError } = await supabase
                .from(queryTable)
                .select(selectProfile)
                .eq(matchColumn, userId);

            if (followError) throw new Error("Could not load follows list.");

            const profiles = followData
                .map((item: any) => item.profiles)
                .filter((p): p is Profile => p !== null);

            const { data: myFollowingData, error: myFollowingError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUser.id);

            if (myFollowingError) throw new Error("Could not check follow status.");
            
            const myFollowingIds = new Set(myFollowingData.map((f: any) => f.following_id));
            
            const processedList: FollowUser[] = profiles.map((p) => ({
                ...p,
                is_following: myFollowingIds.has(p.id)
            }));

            setUserList(processedList);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, currentUser, activeTab]);

    useEffect(() => {
        fetchFollows();
    }, [fetchFollows]);

    const handleFollowToggle = async (targetUserId: string, currentlyFollowing: boolean) => {
        if (!currentUser) return navigate('/auth');

        setUserList(list => list.map(p => 
            p.id === targetUserId ? { ...p, is_following: !currentlyFollowing } : p
        ));
        
        try {
            if (currentlyFollowing) {
                const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: targetUserId });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: targetUserId }] as any);
                if (error) throw error;
            }
        } catch (err: any) {
            console.error("Failed to toggle follow:", err.message);
            setUserList(list => list.map(p => 
                p.id === targetUserId ? { ...p, is_following: currentlyFollowing } : p
            ));
            alert('Something went wrong. Please try again. Error: ' + err.message);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto">
                {profile && (
                    <h1 className="font-display text-4xl font-bold text-center mb-4">
                        <Link to={`/profile/${profile.id}`} className="hover:text-accent transition-colors">@{profile.username}'s</Link> Network
                    </h1>
                )}
                
                <div className="flex justify-center mb-8 bg-gray-200 dark:bg-dark-bg p-1 rounded-full w-fit mx-auto">
                    <button onClick={() => setActiveTab('followers')} className={`font-display px-6 py-2 rounded-full transition-all text-sm sm:text-base ${activeTab === 'followers' ? 'bg-white dark:bg-dark-card shadow-md text-accent' : 'text-secondary-purple dark:text-dark-text'}`}>
                        Followers
                    </button>
                    <button onClick={() => setActiveTab('following')} className={`font-display px-6 py-2 rounded-full transition-all text-sm sm:text-base ${activeTab === 'following' ? 'bg-white dark:bg-dark-card shadow-md text-accent' : 'text-secondary-purple dark:text-dark-text'}`}>
                        Following
                    </button>
                </div>

                {loading ? <AnimeLoader /> : error ? (
                    <p className="text-center text-red-500 py-10">{error}</p>
                ) : (
                  <div className="space-y-4">
                      {userList.length > 0 ? (
                          userList.map(p => (
                              <UserCard 
                                  key={p.id} 
                                  profile={p} 
                                  isCurrentUser={p.id === currentUser?.id}
                                  onFollowToggle={handleFollowToggle}
                              />
                          ))
                      ) : (
                          <p className="text-center py-10 text-secondary-purple/80 dark:text-dark-text/80">
                              {activeTab === 'followers' ? `${profile?.name || profile?.username} doesn't have any followers yet.` : `${profile?.name || profile?.username} isn't following anyone yet.`}
                          </p>
                      )}
                  </div>
                )}
            </div>
        </PageTransition>
    );
}

export default FollowsPage;
