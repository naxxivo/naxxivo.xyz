import React from 'react';
import { HomeIcon, MessageIcon, ProfileIcon, ToolsIcon, DiscoverIcon } from '../common/AppIcons';
import type { AuthView } from '../UserApp';

interface SideNavProps {
    activeView: AuthView;
    setAuthView: (view: 'home' | 'discover' | 'profile' | 'messages' | 'tools') => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeView, setAuthView }) => {
    const navItems = [
        { view: 'home', label: 'Lobby', icon: HomeIcon },
        { view: 'discover', label: 'Leaderboard', icon: DiscoverIcon },
        { view: 'messages', label: 'Messenger', icon: MessageIcon },
        { view: 'profile', label: 'Profile', icon: ProfileIcon },
        { view: 'tools', label: 'Arsenal', icon: ToolsIcon },
    ];

    const profileSubPages: AuthView[] = [
        'settings', 'edit-profile', 'music-library',
        'anime', 'anime-series', 'create-series', 'create-episode',
        'top-up', 'subscriptions', 'manual-payment',
        'store', 'collection', 'info', 'earn-xp', 'upload-cover', 'notifications'
    ];
    
    // An active view is considered part of a main nav item if it's the item itself or one of its children pages.
    const isViewActive = (itemView: AuthView) => {
        if (activeView === itemView) return true;
        if (itemView === 'profile' && profileSubPages.includes(activeView)) return true;
        if (itemView === 'tools' && ['anime', 'top-up', 'store', 'collection', 'info', 'earn-xp', 'music-library'].some(sub => activeView.startsWith(sub))) return true;
        return false;
    }

    return (
        <nav className="w-20 bg-[var(--theme-card-bg)] h-screen flex flex-col items-center justify-between py-4 shadow-2xl z-20 flex-shrink-0">
            <div>
                <div className="text-2xl text-[var(--theme-primary)] mb-10">
                    <div className="w-10 h-10 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center font-bold text-xl font-logo">N</div>
                </div>
                <div className="space-y-6">
                    {navItems.map((item) => {
                        const isActive = isViewActive(item.view as AuthView);
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.view}
                                onClick={() => setAuthView(item.view as any)}
                                className={`w-12 h-12 flex items-center justify-center rounded-lg relative transition-all duration-300 ${isActive ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-lg' : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-secondary)] hover:text-[var(--theme-primary)]'}`}
                                aria-label={item.label}
                                title={item.label}
                            >
                                <Icon isActive={isActive} />
                            </button>
                        )
                    })}
                </div>
            </div>
             <div></div>
        </nav>
    );
};

export default SideNav;
