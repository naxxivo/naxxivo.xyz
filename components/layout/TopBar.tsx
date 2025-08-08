import React from 'react';
import { motion } from 'framer-motion';
import { BackArrowIcon, BellIcon, CoinIcon } from '../common/AppIcons';
import Avatar from '../common/Avatar';
import type { Json } from '../../integrations/supabase/types';
import { formatXp } from '../../utils/helpers';

interface TopBarProps {
    title: string;
    showBackButton: boolean;
    onBack: () => void;
    userProfile: {
        photo_url: string | null;
        name: string | null;
        username: string;
        xp_balance: number;
        active_cover: { preview_url: string | null; asset_details: Json } | null;
    } | null;
    unreadNotificationCount: number;
    onOpenNotifications: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, showBackButton, onBack, userProfile, unreadNotificationCount, onOpenNotifications }) => {
    return (
        <header className="h-16 bg-[var(--theme-header-bg)]/80 backdrop-blur-md flex-shrink-0 flex items-center justify-between px-6 border-b border-[var(--theme-secondary)] z-10">
            <div className="flex items-center">
                {showBackButton && (
                    <motion.button
                        {...{
                            initial: { opacity: 0, x: -10 },
                            animate: { opacity: 1, x: 0 },
                            exit: { opacity: 0, x: -10 },
                        } as any}
                        onClick={onBack}
                        className="mr-4 p-2 -ml-2 rounded-full hover:bg-[var(--theme-secondary)]"
                    >
                        <BackArrowIcon />
                    </motion.button>
                )}
                <h1 className="text-xl font-bold font-logo text-white tracking-wider">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
                 <div className="hidden sm:flex items-center gap-1 text-sm font-bold bg-[var(--theme-secondary)] text-white px-3 py-1.5 rounded-full">
                    <CoinIcon className="w-5 h-5 text-[var(--theme-primary)]"/>
                    <span>{userProfile ? formatXp(userProfile.xp_balance) : 0}</span>
                </div>
                <button onClick={onOpenNotifications} className="relative text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]">
                    <BellIcon />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--theme-header-bg)]" />
                    )}
                </button>
                {userProfile && (
                     <Avatar 
                        photoUrl={userProfile.photo_url} 
                        name={userProfile.username}
                        activeCover={userProfile.active_cover}
                        size="sm"
                    />
                )}
            </div>
        </header>
    );
};

export default TopBar;
