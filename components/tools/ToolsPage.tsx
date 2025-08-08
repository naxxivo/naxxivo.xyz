import React from 'react';
import { ChevronRightIcon, StoreIcon, CollectionIcon, InfoIcon, TrophyIcon } from '../common/AppIcons';
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
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { type: 'spring', stiffness: 400, damping: 25, delay: delay * 0.08 },
        } as any}
        disabled={comingSoon || !onClick}
        className="w-full h-full flex flex-col p-4 bg-[var(--theme-card-bg)] rounded-xl shadow-lg space-y-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--theme-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] focus:ring-offset-[var(--theme-bg)] transition-all text-left"
    >
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[var(--theme-secondary)]/20 rounded-lg text-3xl text-[var(--theme-primary)]">
            {icon}
        </div>
        <div className="flex-grow">
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
            title: "Anime Hub",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>
    );
};

export default ToolsPage;