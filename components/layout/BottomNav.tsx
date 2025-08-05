import React from 'react';

// --- SVG Icons --- //
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AnimeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
    </svg>
);

const UsersIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ProfileIcon = ({ isActive }: { isActive: boolean }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

interface BottomNavProps {
    activeView: 'home' | 'anime' | 'leaderboard' | 'profile' | 'settings' | 'messages';
    setAuthView: (view: 'home' | 'anime' | 'leaderboard' | 'profile') => void;
    onAddPost: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setAuthView, onAddPost }) => {
    const navItems = [
        { view: 'home', label: 'Home', icon: HomeIcon },
        { view: 'anime', label: 'Anime', icon: AnimeIcon },
        { view: 'add', label: 'Create Post', icon: AddIcon },
        { view: 'leaderboard', label: 'Leaderboard', icon: UsersIcon },
        { view: 'profile', label: 'Profile', icon: ProfileIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#1C1B33] shadow-lg z-50">
            <div className="max-w-2xl mx-auto h-full flex justify-around items-center">
                {navItems.map((item) => {
                    if (item.view === 'add') {
                        return (
                             <button
                                key={item.view}
                                onClick={onAddPost}
                                className="p-2 bg-blue-500 text-gray-900 rounded-full shadow-lg hover:bg-blue-600 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-[#1C1B33]"
                                aria-label={item.label}
                            >
                               <AddIcon />
                            </button>
                        )
                    }
                    const isActive = activeView === item.view || (item.view === 'profile' && activeView === 'settings');
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.view}
                            onClick={() => setAuthView(item.view as 'home' | 'anime' | 'leaderboard' | 'profile')}
                            className={`transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
                            aria-label={item.label}
                        >
                            <Icon isActive={isActive} />
                        </button>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNav;