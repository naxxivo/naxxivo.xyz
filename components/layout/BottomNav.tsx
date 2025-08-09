import React from 'react';
import { motion } from 'framer-motion';
import { MessageIcon, DiscoverIcon, ProfileIcon } from '../common/AppIcons';
import type { AuthView } from '../UserApp';

interface BottomNavProps {
    activeView: AuthView;
    setAuthView: (view: 'discover' | 'profile' | 'messages') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setAuthView }) => {
    const navItems = [
        { view: 'discover', label: 'Discover', icon: DiscoverIcon },
        { view: 'messages', label: 'Messages', icon: MessageIcon },
        { view: 'profile', label: 'Profile', icon: ProfileIcon },
    ];

    const profileSubPages: AuthView[] = [
        'settings', 'edit-profile', 'music-library', 'tools', 
        'anime', 'anime-series', 'create-series', 'create-episode',
        'top-up', 'subscriptions', 'manual-payment',
        'store', 'collection', 'info', 'earn-xp', 'upload-cover',
        'notifications', 'events'
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-20 bg-[var(--theme-header-bg)]/80 backdrop-blur-lg border-t border-t-[var(--theme-secondary)]/30 z-50">
            <div className="h-full flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = activeView === item.view || (item.view === 'profile' && profileSubPages.includes(activeView));
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.view}
                            onClick={() => setAuthView(item.view as 'discover' | 'profile' | 'messages')}
                            className={`transition-colors duration-200 relative flex flex-col items-center justify-center h-full w-20 ${isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-header-text)]/70 hover:text-[var(--theme-header-text)]'}`}
                            aria-label={item.label}
                        >
                            <Icon isActive={isActive} />
                            {isActive && <motion.div {...{layoutId: "active-nav-dot"} as any} className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full" />}
                        </button>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNav;