import React from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, MessageIcon, AddIcon, DiscoverIcon, ProfileIcon } from '../common/AppIcons';

type AuthView = 
    'home' | 'discover' | 'profile' | 'settings' | 'messages' | 'edit-profile' | 'music-library' | 
    'tools' | 'anime' | 'anime-series' | 'create-series' | 'create-episode' |
    'top-up' | 'subscriptions' | 'manual-payment';

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
        'top-up', 'subscriptions', 'manual-payment'
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-20 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
            <div className="h-full flex justify-around items-center">
                {navItems.map((item) => {
                    if (item.view === 'add') {
                        return (
                             <motion.button
                                key={item.view}
                                onClick={onAddPost}
                                className="p-3 bg-violet-500 text-white rounded-2xl shadow-lg -translate-y-4 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                                aria-label={item.label}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
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
                            className={`transition-colors duration-200 relative ${isActive ? 'text-violet-600' : 'text-gray-400 hover:text-violet-500'}`}
                            aria-label={item.label}
                        >
                            <Icon isActive={isActive} />
                            {isActive && <motion.div layoutId="active-nav-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-violet-600 rounded-full" />}
                        </button>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
