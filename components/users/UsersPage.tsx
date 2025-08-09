import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, Json } from '../../integrations/supabase/types';
import { SearchIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon, TrophyIcon, GoldCoinIcon, DiamondIcon, SilverCoinIcon } from '../common/AppIcons';
import { formatXp } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';

interface UsersPageProps {
    session: Session;
    onViewProfile: (userId: string) => void;
}

type Profile = Pick<Tables<'profiles'>, 'id' | 'name' | 'username' | 'photo_url' | 'xp_balance' | 'gold_coins' | 'silver_coins' | 'diamond_coins'> & {
    active_cover: { preview_url: string | null, asset_details: Json } | null;
};
type LeaderboardCategory = 'xp' | 'gold' | 'silver' | 'diamond';

const UserRow: React.FC<{ user: Profile, rank: number, category: LeaderboardCategory, onViewProfile: (userId: string) => void }> = ({ user, rank, category, onViewProfile }) => {
    const isTopThree = rank <= 3;
    const rankIcon = [
        <GoldMedalIcon className="w-8 h-8" />,
        <SilverMedalIcon className="w-8 h-8" />,
        <BronzeMedalIcon className="w-8 h-8" />
    ][rank - 1];
    
    const cardBgClass = isTopThree ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10' : 'bg-[var(--theme-card-bg)]';

    const categoryData = useMemo(() => {
        switch(category) {
            case 'gold': return { value: user.gold_coins ?? 0, icon: <GoldCoinIcon className="w-5 h-5 text-yellow-500"/>, label: 'Gold' };
            case 'silver': return { value: user.silver_coins ?? 0, icon: <SilverCoinIcon className="w-5 h-5 text-gray-400"/>, label: 'Silver' };
            case 'diamond': return { value: user.diamond_coins ?? 0, icon: <DiamondIcon className="w-5 h-5 text-cyan-400"/>, label: 'Diamonds' };
            case 'xp':
            default:
                return { value: user.xp_balance, icon: <TrophyIcon className="w-5 h-5 text-violet-500"/>, label: 'XP' };
        }
    }, [category, user]);

    return (
        <motion.button
            layout
            onClick={() => onViewProfile(user.id)}
            className={`w-full flex items-center p-3 rounded-xl hover:bg-opacity-80 transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] shadow-sm ${cardBgClass}`}
            {...{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -20 },
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
                <p className="font-bold text-lg text-[var(--theme-primary)] flex items-center justify-end gap-1">
                    {categoryData.icon}
                    {formatXp(categoryData.value)}
                </p>
                <p className="text-xs text-[var(--theme-text-secondary)]">{categoryData.label}</p>
            </div>
        </motion.button>
    );
};


const UsersPage: React.FC<UsersPageProps> = ({ session, onViewProfile }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<LeaderboardCategory>('xp');

    const tabs: { id: LeaderboardCategory; label: string; icon: React.ReactNode }[] = [
        { id: 'xp', label: 'XP', icon: <TrophyIcon className="w-5 h-5"/> },
        { id: 'gold', label: 'Gold', icon: <GoldCoinIcon className="w-5 h-5"/> },
        { id: 'silver', label: 'Silver', icon: <SilverCoinIcon className="w-5 h-5"/> },
        { id: 'diamond', label: 'Diamond', icon: <DiamondIcon className="w-5 h-5"/> }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, name, username, photo_url, xp_balance, gold_coins, silver_coins, diamond_coins, active_cover:active_cover_id(preview_url, asset_details)');

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

    const sortedAndFilteredUsers = useMemo(() => {
        const sorted = [...profiles].sort((a, b) => {
            switch(activeTab) {
                case 'gold': return (b.gold_coins ?? 0) - (a.gold_coins ?? 0);
                case 'silver': return (b.silver_coins ?? 0) - (a.silver_coins ?? 0);
                case 'diamond': return (b.diamond_coins ?? 0) - (a.diamond_coins ?? 0);
                case 'xp':
                default:
                    return b.xp_balance - a.xp_balance;
            }
        });

        if (!searchTerm) return sorted;

        const lowercasedTerm = searchTerm.toLowerCase();
        return sorted.filter(p =>
            p.name?.toLowerCase().includes(lowercasedTerm) ||
            p.username.toLowerCase().includes(lowercasedTerm)
        );
    }, [profiles, searchTerm, activeTab]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }
    
    if (error) {
        return <div className="text-center pt-20 text-red-500" role="alert"><p>Error loading users: {error}</p></div>;
    }

    return (
        <div className="bg-[var(--theme-bg)] min-h-screen">
            <header className="sticky top-0 z-20 bg-[var(--theme-header-bg)]/80 backdrop-blur-lg rounded-b-3xl shadow-lg border-b border-[var(--theme-secondary)]/30">
                <div className="p-4 pt-6 text-center">
                    <h1 className="text-2xl font-bold text-[var(--theme-header-text)]">Leaderboard</h1>
                </div>
                <div className="relative px-4 pb-4">
                     <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-[var(--theme-text-secondary)]">
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
                 <div className="px-4 pb-3">
                    <div className="p-1 bg-[var(--theme-card-bg-alt)] rounded-full flex items-center justify-between gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 relative px-2 py-2 text-xs font-bold rounded-full transition-colors ${activeTab === tab.id ? 'text-[var(--theme-primary-text)]' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]'}`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-tab-indicator"
                                        className="absolute inset-0 bg-[var(--theme-primary)] rounded-full z-0"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-1.5">{tab.icon} {tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="p-4 space-y-3">
                <AnimatePresence>
                    {sortedAndFilteredUsers.length > 0 ? (
                        sortedAndFilteredUsers.map((profile, index) => (
                            <UserRow
                                key={profile.id} // Stable key
                                user={profile}
                                rank={index + 1}
                                category={activeTab}
                                onViewProfile={onViewProfile}
                            />
                        ))
                    ) : (
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 px-4 bg-[var(--theme-card-bg-alt)] rounded-2xl"
                         >
                            <h2 className="text-xl font-semibold text-[var(--theme-text)]">No users found</h2>
                            <p className="text-[var(--theme-text-secondary)] mt-2">Try adjusting your search!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UsersPage;