import React from 'react';
import { HomeIcon, DiscoverIcon, AddIcon, MessageIcon, ProfileIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';
import type { AuthView } from '../UserApp';

interface BottomNavProps {
    activeView: AuthView;
    setAuthView: (view: 'home' | 'discover' | 'profile' | 'messages') => void;
    onAddPost: () => void;
}

const NavItem = ({ icon: Icon, view, label, isActive, onClick }: { icon: React.FC<any>, view: string, label: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${isActive ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]'}`}>
        <Icon isActive={isActive} />
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setAuthView, onAddPost }) => {
    
    const mainViews: AuthView[] = ['home', 'discover', 'messages', 'profile'];
    const isMainView = mainViews.includes(activeView);

    // This component is only for main views, it will be hidden on sub-pages.
    const shouldRender = [
        'home', 'discover', 'messages', 'profile'
    ].includes(activeView);

    if (!shouldRender) {
        return null; // Don't render the nav bar on detail pages etc.
    }


    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--theme-card-bg)] shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] z-50 max-w-sm mx-auto rounded-t-2xl">
            <div className="flex items-center justify-around h-full">
                <NavItem icon={HomeIcon} view="home" label="Home" isActive={activeView === 'home'} onClick={() => setAuthView('home')} />
                <NavItem icon={DiscoverIcon} view="discover" label="Discover" isActive={activeView === 'discover'} onClick={() => setAuthView('discover')} />
                
                <motion.button
                    onClick={onAddPost}
                    className="w-14 h-14 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] rounded-full flex items-center justify-center shadow-lg -mt-8"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <AddIcon />
                </motion.button>

                <NavItem icon={MessageIcon} view="messages" label="Messages" isActive={activeView === 'messages'} onClick={() => setAuthView('messages')} />
                <NavItem icon={ProfileIcon} view="profile" label="Profile" isActive={activeView === 'profile'} onClick={() => setAuthView('profile')} />
            </div>
        </footer>
    );
};

export default BottomNav;