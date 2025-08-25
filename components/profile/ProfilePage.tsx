import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';
import { formatXp } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import EditProfileModal from './EditProfileModal';
import LoadingScreen from '../LoadingScreen';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePageProps {
  user: User;
  onNavigateHome: () => void;
}

const ProfileHeader: React.FC<{ 
    profile: Profile, 
    user: User, 
    followerCount: number, 
    followingCount: number,
    onEdit: () => void
    onNavigateHome: () => void 
}> = ({ profile, user, followerCount, followingCount, onEdit, onNavigateHome }) => (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="h-48 md:h-64 bg-gray-200 relative">
            <img 
                src={profile.cover_url || 'https://picsum.photos/seed/cover/1200/400'} 
                alt="Cover" 
                className="w-full h-full object-cover"
            />
            <button onClick={onNavigateHome} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10" aria-label="Go back home">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
        </div>
        <div className="p-4 md:p-6 -mt-16 md:-mt-20 flex flex-col items-center md:items-start md:flex-row gap-4 relative">
            <div className="border-4 border-white rounded-full shadow-md">
                 <Avatar avatarUrl={profile.photo_url} name={profile.name || user.email} size={128} />
            </div>
            <div className="mt-16 md:mt-0 md:ml-4 flex-grow text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">{profile.name || 'NaxStore User'}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-gray-700 mt-2 max-w-lg">{profile.bio || 'No bio yet.'}</p>
                 <div className="flex justify-center md:justify-start gap-4 mt-3">
                    <p><span className="font-bold">{formatXp(followerCount)}</span> <span className="text-gray-500">Followers</span></p>
                    <p><span className="font-bold">{formatXp(followingCount)}</span> <span className="text-gray-500">Following</span></p>
                </div>
            </div>
             <div className="absolute top-20 right-4 md:static md:ml-auto">
                 <button onClick={onEdit} className="bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                    Edit Profile
                </button>
            </div>
        </div>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigateHome }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) setProfile(data);

            const { count: followers } = await supabase.from('follows').select('*', { count: 'exact' }).eq('following_id', user.id);
            setFollowerCount(followers || 0);

            const { count: following } = await supabase.from('follows').select('*', { count: 'exact' }).eq('follower_id', user.id);
            setFollowingCount(following || 0);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch profile data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    if (loading) return <LoadingScreen />;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!profile) return <div className="p-4 text-center">Could not find your profile.</div>;

    return (
        <div className="animate-fade-in max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <ProfileHeader 
                profile={profile} 
                user={user} 
                followerCount={followerCount} 
                followingCount={followingCount}
                onEdit={() => setIsEditModalOpen(true)}
                onNavigateHome={onNavigateHome}
            />
            
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">My Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-gray-200 aspect-square rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>

            {isEditModalOpen && (
                <EditProfileModal
                    user={user}
                    profile={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={() => {
                        setIsEditModalOpen(false);
                        fetchProfile(); // Refresh profile data
                    }}
                />
            )}
        </div>
    );
};

export default ProfilePage;