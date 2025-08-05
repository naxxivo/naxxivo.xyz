import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import UserCard from './UserCard';
import type { Tables } from '../../integrations/supabase/types';

interface UsersPageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
}

type Profile = Tables<'profiles'>;

// Search Icon
const SearchIcon = () => (
    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const UsersPage: React.FC<UsersPageProps> = ({ session, onViewProfile }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const myId = session.user.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all profiles and the current user's follow list in parallel
                const [profilesPromise, followsPromise] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, created_at, name, username, photo_url, cover_url, bio, website_url, youtube_url, facebook_url, xp_balance, role, admin, address')
                        .order('xp_balance', { ascending: false }), // Order by XP for leaderboard
                    supabase.from('follows').select('following_id').eq('follower_id', myId)
                ]);

                const { data: profilesData, error: profilesError } = profilesPromise;
                if (profilesError) throw profilesError;
                if (profilesData) setProfiles(profilesData as Profile[]);

                const { data: followsData, error: followsError } = followsPromise;
                if (followsError) throw followsError;
                if (followsData) {
                    const followingIds = new Set((followsData as { following_id: string }[]).map(f => f.following_id));
                    setFollowingSet(followingIds);
                }

            } catch (err: any) {
                setError(err.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [myId]);

    const filteredProfiles = useMemo(() => {
        if (!searchTerm) return profiles;
        const lowercasedTerm = searchTerm.toLowerCase();
        return profiles.filter(profile =>
            profile.name?.toLowerCase().includes(lowercasedTerm) ||
            profile.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [profiles, searchTerm]);
    
    const maxXP = useMemo(() => (profiles?.[0]?.xp_balance) || 0, [profiles]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1C1B33] border-transparent rounded-full text-white placeholder-gray-500 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Search users"
                />
            </div>
            
            {loading && (
                 <div className="flex justify-center pt-20">
                    <LoadingSpinner />
                </div>
            )}
            
            {error && (
                <div className="text-center pt-20 text-red-400" role="alert">
                    <p>Error loading users: {error}</p>
                </div>
            )}

            {!loading && !error && filteredProfiles.length === 0 && (
                <div className="text-center py-16 px-4 bg-[#1C1B33] rounded-2xl">
                    <h2 className="text-xl font-semibold text-white">No users found</h2>
                    <p className="text-gray-400 mt-2">{searchTerm ? 'Try a different search term.' : 'The community is just getting started!'}</p>
                </div>
            )}

            {!loading && filteredProfiles.length > 0 && (
                <div className="space-y-3">
                    {filteredProfiles.map((profile, index) => (
                         <UserCard
                            key={profile.id}
                            profile={profile}
                            session={session}
                            isInitiallyFollowing={followingSet.has(profile.id)}
                            onViewProfile={onViewProfile}
                            rank={searchTerm ? undefined : index + 1} // Only show rank if not searching
                            maxXP={maxXP}
                         />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersPage;