import React from 'react';
import { BackArrowIcon, ChevronRightIcon, StoreIcon, CollectionIcon, InfoIcon, TrophyIcon, AdminIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';

interface ToolsPageProps {
    onBack: () => void;
    onNavigateToAnime: () => void;
    onNavigateToTopUp: () => void;
    onNavigateToMusicLibrary: () => void;
    onNavigateToStore: () => void;
    onNavigateToCollection: () => void;
    onNavigateToInfo: () => void;
    onNavigateToEarnXp: () => void;
}

const ToolListItem = ({ title, description, icon, comingSoon, delay, onClick }: { title: string, description: string, icon: React.ReactNode, comingSoon?: boolean, delay: number, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        {...{
            initial: { opacity: 0, x: -30 },
            animate: { opacity: 1, x: 0 },
            transition: { type: 'spring', stiffness: 400, damping: 25, delay: delay * 0.08 },
        } as any}
        disabled={comingSoon || !onClick}
        className="w-full flex items-center p-4 bg-[var(--theme-card-bg)] rounded-xl shadow-sm space-x-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] focus:ring-offset-[var(--theme-bg)] transition-all"
    >
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--theme-secondary)]/20 rounded-lg text-2xl text-[var(--theme-text-secondary)]">
            {icon}
        </div>
        <div className="flex-grow text-left">
            <h3 className="font-bold text-[var(--theme-text)] flex items-center">
                {title}
                {comingSoon && (
                    <span className="ml-2 bg-[var(--theme-text-secondary)]/20 text-[var(--theme-text-secondary)] text-xs font-semibold px-2 py-0.5 rounded-full">
                        SOON
                    </span>
                )}
            </h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">{description}</p>
        </div>
        {!comingSoon && <ChevronRightIcon className="flex-shrink-0 text-[var(--theme-text-secondary)]" />}
    </motion.button>
);


const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, onNavigateToAnime, onNavigateToTopUp, onNavigateToMusicLibrary, onNavigateToStore, onNavigateToCollection, onNavigateToInfo, onNavigateToEarnXp }) => {
    
    const allTools = [
        {
            title: "Earn XP",
            description: "Complete daily tasks to earn rewards.",
            icon: <TrophyIcon />,
            onClick: onNavigateToEarnXp,
            comingSoon: false,
        },
        {
            title: "Top Up XP",
            description: "Purchase XP and redeem gift codes.",
            icon: '✨',
            onClick: onNavigateToTopUp,
            comingSoon: false,
        },
        {
            title: "The Bazaar",
            description: "Acquire new profile effects, themes, and more.",
            icon: <StoreIcon />,
            onClick: onNavigateToStore,
            comingSoon: false,
        },
        {
            title: "My Satchel",
            description: "View and manage your collected items.",
            icon: <CollectionIcon />,
            onClick: onNavigateToCollection,
            comingSoon: false,
        },
         {
            title: "Music & Animations",
            description: "Customize your profile's music and GIF.",
            icon: '🎵',
            onClick: onNavigateToMusicLibrary,
            comingSoon: false,
        },
        {
            title: "Watch Anime",
            description: "Stream your favorite anime series.",
            icon: '📺',
            onClick: onNavigateToAnime,
            comingSoon: false,
        },
        {
            title: "The Guidebook",
            description: "Learn about rules, features, and what's next.",
            icon: <InfoIcon />,
            onClick: onNavigateToInfo,
            comingSoon: false,
        },
    ];


    return (
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <header className="flex items-center p-4 border-b border-black/10 dark:border-white/10 bg-[var(--theme-card-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-text)] mx-auto">Tools & Features</h1>
                 {/* Placeholder for centering */}
                <div className="w-6"></div>
            </header>

            <main className="p-4 space-y-3">
                {allTools.map((tool, index) => (
                    <ToolListItem
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        comingSoon={tool.comingSoon}
                        delay={index}
                        onClick={tool.onClick}
                    />
                ))}
            </main>
        </div>
    );
};

export default ToolsPage;