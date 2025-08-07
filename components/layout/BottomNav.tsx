import React from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, MessageIcon, AddIcon, DiscoverIcon, ProfileIcon } from '../common/AppIcons';
import type { AuthView } from '../UserApp';

interface BottomNavProps {
    activeView: AuthView;
    setAuthView: (view: 'home' | 'discover' | 'profile' | 'messages') => void;
    onAddPost: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setAuthView, onAddPost }) => {
    const navItems = [
        { view: 'home', label: 'Home', icon: HomeIcon },
        { view: 'messages', label: 'Messages', icon: MessageIcon },
        { view: 'add', label: 'Create Post', icon: AddIcon },
        { view: 'discover', label: 'Discover', icon: DiscoverIcon },
        { view: 'profile', label: 'Profile', icon: ProfileIcon },
    ];

    const profileSubPages: AuthView[] = [
        'settings', 'edit-profile', 'music-library', 'tools', 
        'anime', 'anime-series', 'create-series', 'create-episode',
        'top-up', 'subscriptions', 'manual-payment',
        'store', 'collection', 'info', 'earn-xp', 'upload-cover'
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-20 bg-[var(--theme-header-bg)]/80 backdrop-blur-lg border-t border-t-[var(--theme-secondary)]/30 z-50">
            <div className="h-full flex justify-around items-center">
                {navItems.map((item) => {
                    if (item.view === 'add') {
                        return (
                             <motion.button
                                key={item.view}
                                onClick={onAddPost}
                                className="p-3 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] rounded-2xl shadow-lg -translate-y-4 hover:bg-[var(--theme-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]"
                                aria-label={item.label}
                                {...{
                                    whileHover: { scale: 1.1, rotate: 90 },
                                    whileTap: { scale: 0.9 },
                                } as any}
                            >
                               <AddIcon />
                            </motion.button>
                        )
                    }
                    const isActive = activeView === item.view || (item.view === 'profile' && profileSubPages.includes(activeView));
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.view}
                            onClick={() => setAuthView(item.view as 'home' | 'discover' | 'profile' | 'messages')}
                            className={`transition-colors duration-200 relative ${isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-header-text)]/70 hover:text-[var(--theme-header-text)]'}`}
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