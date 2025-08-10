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

const getCategoryData = (user: Profile, category: LeaderboardCategory) => {
    switch(category) {
        case 'gold': return { value: user.gold_coins ?? 0, icon: <GoldCoinIcon className="w-5 h-5 text-yellow-500"/>, label: 'Gold' };
        case 'silver': return { value: user.silver_coins ?? 0, icon: <SilverCoinIcon className="w-5 h-5 text-gray-400"/>, label: 'Silver' };
        case 'diamond': return { value: user.diamond_coins ?? 0, icon: <DiamondIcon className="w-5 h-5 text-cyan-400"/>, label: 'Diamonds' };
        case 'xp':
        default: return { value: user.xp_balance, icon: <TrophyIcon className="w-5 h-5 text-violet-500"/>, label: 'XP' };
    }
};

const PodiumUser: React.FC<{user: Profile, rank: number, category: LeaderboardCategory, onViewProfile: (userId: string) => void}> = ({ user, rank, category, onViewProfile }) => {
    const isFirst = rank === 1;
    const categoryData = getCategoryData(user, category);
    const medalIcon = [<GoldMedalIcon className="medal-icon" />, <SilverMedalIcon className="medal-icon" />, <BronzeMedalIcon className="medal-icon" />][rank - 1];
    
    return (
        <motion.div
            onClick={() => onViewProfile(user.id)}
            className="flex flex-col items-center w-1/3 cursor-pointer"
            {...{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { type: 'spring', stiffness: 200, damping: 15, delay: rank * 0.1 },
            } as any}
        >
            <div className={`relative ${isFirst ? 'mb-2' : ''}`}>
                 <div className="podium-avatar-shine">
                    <Avatar
                        photoUrl={user.photo_url}
                        name={user.username}
                        activeCover={user.active_cover}
                        size={isFirst ? "xl" : "lg"}
                        containerClassName="shadow-lg rounded-full"
                        imageClassName="border-4 border-[var(--theme-card-bg)]"
                    />
                </div>
                {medalIcon}
            </div>
            <p className="podium-user-name font-bold text-sm text-[var(--theme-text)] mt-2 truncate w-full">{user.name || user.username}</p>
            <div className="score-badge">{formatXp(categoryData.value)}</div>
            <div className={`podium-base w-full mt-3 ${isFirst ? 'h-24' : (rank === 2 ? 'h-16' : 'h-12')}`}>
                <span className="podium-rank-number">{rank}</span>
            </div>
        </motion.div>
    );
};


const ListUserRow: React.FC<{ user: Profile, rank: number, category: LeaderboardCategory, onViewProfile: (userId: string) => void }> = ({ user, rank, category, onViewProfile }) => {
    const categoryData = getCategoryData(user, category);
    return (
        <motion.button
            onClick={() => onViewProfile(user.id)}
            className="w-full flex items-center p-2 rounded-xl hover:bg-[var(--theme-card-bg-alt)] transition-all text-left"
            {...{
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: 20 },
                transition: { type: 'spring', stiffness: 300, damping: 25 },
            } as any}
        >
            <div className="font-semibold text-base w-8 text-center text-[var(--theme-text-secondary)]">{rank}</div>
            <Avatar
                photoUrl={user.photo_url}
                name={user.username}
                activeCover={user.active_cover}
                size="md"
                containerClassName="ml-2"
            />
            <div className="ml-3 flex-grow overflow-hidden">
                <p className="truncate font-semibold text-[var(--theme-text)]">{user.name || user.username}</p>
                <p className="text-sm truncate text-[var(--theme-text-secondary)]">@{user.username}</p>
            </div>
            <div className="ml-2 text-right">
                <p className="font-bold text-base text-[var(--theme-text)] flex items-center justify-end gap-1.5">
                    <span className="text-[var(--theme-star-rating)]">⭐</span>
                    {formatXp(categoryData.value)}
                </p>
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
        return <div className="flex justify-center items-center h-screen bg-[var(--theme-bg)]"><LoadingSpinner /></div>;
    }
    
    if (error) {
        return <div className="text-center pt-20 text-red-500" role="alert"><p>Error loading users: {error}</p></div>;
    }

    const topThree = sortedAndFilteredUsers.slice(0, 3);
    const otherUsers = sortedAndFilteredUsers.slice(3);
    const user1 = topThree.length > 0 ? topThree[0] : null;
    const user2 = topThree.length > 1 ? topThree[1] : null;
    const user3 = topThree.length > 2 ? topThree[2] : null;

    return (
        <div className="bg-[var(--theme-bg)] text-[var(--theme-text)] min-h-screen">
            <header className="sticky top-0 z-20 bg-[var(--theme-bg)]/80 backdrop-blur-lg">
                <div className="p-4 pt-6 text-center">
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
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
                                        {...{
                                            layoutId: "active-tab-indicator",
                                            transition: { type: 'spring', stiffness: 400, damping: 30 },
                                        } as any}
                                        className="absolute inset-0 bg-[var(--theme-primary)] rounded-full z-0"
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-1.5">{tab.icon} {tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>
            
            <AnimatePresence>
                {topThree.length > 0 && (
                    <div className="flex items-end justify-center gap-2 px-4 py-8">
                        {user2 && <PodiumUser user={user2} rank={2} category={activeTab} onViewProfile={onViewProfile} />}
                        {user1 && <PodiumUser user={user1} rank={1} category={activeTab} onViewProfile={onViewProfile} />}
                        {user3 && <PodiumUser user={user3} rank={3} category={activeTab} onViewProfile={onViewProfile} />}
                    </div>
                )}
            </AnimatePresence>

            <div className="px-2 space-y-2">
                <AnimatePresence>
                    {otherUsers.length > 0 ? (
                        otherUsers.map((profile, index) => (
                            <ListUserRow
                                key={profile.id}
                                user={profile}
                                rank={index + 4}
                                category={activeTab}
                                onViewProfile={onViewProfile}
                            />
                        ))
                    ) : topThree.length === 0 ? (
                         <motion.div
                            {...{
                                initial: { opacity: 0, y: 20 },
                                animate: { opacity: 1, y: 0 },
                            } as any}
                            className="text-center py-16 px-4"
                         >
                            <h2 className="text-xl font-semibold text-[var(--theme-text)]">No users found</h2>
                            <p className="text-[var(--theme-text-secondary)] mt-2">Try adjusting your search!</p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UsersPage;