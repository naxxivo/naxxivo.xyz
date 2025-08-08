import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, Json } from '../../integrations/supabase/types';
import { SearchIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from '../common/AppIcons';
import { formatXp } from '../../utils/helpers';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';

interface UsersPageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
}

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'xp_balance'> & {
    active_cover: { preview_url: string | null, asset_details: Json } | null;
};

const UserRow: React.FC<{ user: Profile, rank: number, onViewProfile: (userId: string) => void }> = ({ user, rank, onViewProfile }) => {
    const isTopThree = rank <= 3;
    const rankIcon = [
        <GoldMedalIcon className="w-8 h-8" />,
        <SilverMedalIcon className="w-8 h-8" />,
        <BronzeMedalIcon className="w-8 h-8" />
    ][rank - 1];
    
    const cardBgClass = isTopThree ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10' : 'bg-[var(--theme-card-bg)]';

    return (
        <motion.button
            onClick={() => onViewProfile(user.id)}
            className={`w-full flex items-center p-3 rounded-xl hover:bg-opacity-80 transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] shadow-sm ${cardBgClass}`}
            {...{
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { type: 'spring', stiffness: 300, damping: 25 },
            } as any}
        >
            <div className="font-bold text-lg w-10 text-center text-[var(--theme-text-secondary)] flex items-center justify-center">
                 {isTopThree ? rankIcon : <span className="text-xl">{rank}</span>}
            </div>
            <Avatar
                photoUrl={user.photo_url}
                name={user.username}
                activeCover={user.active_cover}
                size="lg"
                containerClassName="ml-2"
            />
            <div className="ml-4 flex-grow overflow-hidden">
                <p className="truncate font-bold text-[var(--theme-text)]">{user.name || user.username}</p>
                <p className="text-sm truncate text-[var(--theme-text-secondary)]">@{user.username}</p>
            </div>
            <div className="ml-2 text-right">
                <p className="font-bold text-lg text-[var(--theme-primary)]">{formatXp(user.xp_balance)}</p>
                <p className="text-xs text-[var(--theme-text-secondary)]">Score</p>
            </div>
        </motion.button>
    );
};


const UsersPage: React.FC<UsersPageProps> = ({ session, onViewProfile }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, name, username, photo_url, xp_balance, active_cover:active_cover_id(preview_url, asset_details)')
                        .order('xp_balance', { ascending: false });

                if (profilesError) throw profilesError;
                setProfiles((profilesData as any[]) || []);

            } catch (err: any) {
                setError(err.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return profiles;
        const lowercasedTerm = searchTerm.toLowerCase();
        return profiles.filter(p =>
            p.name?.toLowerCase().includes(lowercasedTerm) ||
            p.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [profiles, searchTerm]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }
    
    if (error) {
        return <div className="text-center pt-20 text-red-500" role="alert"><p>Error loading users: {error}</p></div>;
    }

    return (
        <div className="bg-[var(--theme-bg)] min-h-screen">
            <div className="relative bg-[var(--theme-header-bg)] p-4 pb-8 rounded-b-[2.5rem] text-[var(--theme-header-text)] shadow-xl border-b-2 border-[var(--theme-primary)]">
                <div className="pt-2 text-center">
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                </div>
                <div className="relative mt-4">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--theme-text-secondary)]">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Users"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--theme-secondary)] border-transparent rounded-full text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
                    />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((profile, index) => (
                        <UserRow
                            key={profile.id}
                            user={profile}
                            rank={index + 1} // Ranks start from 1
                            onViewProfile={onViewProfile}
                        />
                    ))
                ) : (
                     <div className="text-center py-16 px-4 bg-[var(--theme-card-bg-alt)] rounded-2xl">
                        <h2 className="text-xl font-semibold text-[var(--theme-text)]">No users found</h2>
                        <p className="text-[var(--theme-text-secondary)] mt-2">Try adjusting your search!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;