import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import UserCard from './UserCard';
import type { Tables } from '../../integrations/supabase/types';
import { SearchIcon } from '../common/AppIcons';

interface UsersPageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
}

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'xp_balance' | 'created_at'>;

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
                const [profilesPromise, followsPromise] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, name, username, photo_url, xp_balance, created_at')
                        .order('created_at', { ascending: false }),
                    supabase.from('follows').select('following_id').eq('follower_id', myId)
                ]);

                const { data: profilesData, error: profilesError } = profilesPromise;
                if (profilesError) throw profilesError;
                if (profilesData) setProfiles(profilesData.filter(p => p.id !== myId));

                const { data: followsData, error: followsError } = followsPromise;
                if (followsError) throw followsError;
                if (followsData) {
                    const followingIds = new Set(followsData.map(f => f.following_id));
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
        return profiles.filter(p =>
            p.name?.toLowerCase().includes(lowercasedTerm) ||
            p.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [profiles, searchTerm]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Discover</h1>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Search for travelers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 border-transparent rounded-full text-gray-800 placeholder-gray-500 px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>
            
            {loading && (
                 <div className="flex justify-center pt-20">
                    <LoadingSpinner />
                </div>
            )}
            
            {error && (
                <div className="text-center pt-20 text-red-500" role="alert">
                    <p>Error loading users: {error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-4">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map(profile => (
                            <UserCard
                                key={profile.id}
                                profile={profile}
                                session={session}
                                isInitiallyFollowing={followingSet.has(profile.id)}
                                onViewProfile={onViewProfile}
                            />
                        ))
                    ) : (
                         <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl">
                            <h2 className="text-xl font-semibold text-gray-800">No users found</h2>
                            <p className="text-gray-500 mt-2">Try adjusting your search or check back later!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UsersPage;