import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { generateAvatar, formatXp } from '@/utils/helpers';
import type { Tables } from '../../integrations/supabase/types';
import Button from '../common/Button';
import { motion } from 'framer-motion';

type Profile = Tables<'profiles'>;

interface UserCardProps {
    profile: Profile;
    session: Session;
    isInitiallyFollowing: boolean;
    onViewProfile: (userId: string) => void;
    rank?: number;
    maxXP?: number;
}

const UserCard: React.FC<UserCardProps> = ({ profile, session, isInitiallyFollowing, onViewProfile, rank, maxXP }) => {
    const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

    const isMyProfile = profile.id === session.user.id;

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when clicking button
        if (isMyProfile) return;
        setIsUpdatingFollow(true);
        try {
            if (isFollowing) {
                await supabase.from('follows').delete().match({ follower_id: session.user.id, following_id: profile.id });
                setIsFollowing(false);
            } else {
                await supabase.from('follows').insert([{ follower_id: session.user.id, following_id: profile.id }] as any);
                setIsFollowing(true);
            }
        } catch (error: any) {
            console.error("Failed to update follow status:", error.message);
        } finally {
            setIsUpdatingFollow(false);
        }
    };
    
    const rankColors: { [key: number]: string } = {
        1: 'bg-yellow-400 text-yellow-900',
        2: 'bg-gray-400 text-gray-900',
        3: 'bg-yellow-600 text-yellow-100'
    };
    const rankBadgeClass = rank !== undefined && rank < 4 ? rankColors[rank] : 'bg-gray-700 text-gray-200';
    
    const xpProgress = maxXP && profile.xp_balance > 0 ? (profile.xp_balance / maxXP) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-full"
        >
            <button
                onClick={() => onViewProfile(profile.id)}
                className="w-full flex flex-col p-4 bg-[#1C1B33] rounded-2xl hover:bg-[#2a2942] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            >
                <div className="w-full flex items-center">
                    {rank !== undefined && (
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-xl font-bold ${rankBadgeClass}`}>
                            {rank < 4 ? (rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉') : rank}
                        </div>
                    )}
                    <div className={`w-14 h-14 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 ${rank !== undefined ? 'ml-4' : ''}`}>
                        <img 
                            src={profile.photo_url || generateAvatar(profile.name || profile.username)} 
                            alt={profile.name || ''} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="ml-4 flex-grow overflow-hidden">
                        <p className="truncate font-bold text-white">{profile.name || profile.username}</p>
                        <p className="text-sm truncate text-yellow-400 font-semibold">{formatXp(profile.xp_balance)} XP</p>
                    </div>
                    {!isMyProfile && (
                        <div className="ml-2 w-28 flex-shrink-0">
                             <Button
                                onClick={handleFollowToggle}
                                size="small"
                                variant={isFollowing ? 'secondary' : 'primary'}
                                disabled={isUpdatingFollow}
                             >
                                {isUpdatingFollow ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                             </Button>
                        </div>
                    )}
                </div>
                 {rank !== undefined && maxXP && maxXP > 0 && (
                    <div className="mt-3 px-1">
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}
            </button>
        </motion.div>
    );
};

export default UserCard;