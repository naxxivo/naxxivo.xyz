import React from 'react';
import { BackArrowIcon, StoreIcon, CollectionIcon, InfoIcon, TrophyIcon, TicketIcon } from '../common/AppIcons';
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
    onNavigateToEvents: () => void;
}

const ToolCard = ({ title, description, icon, comingSoon, delay, onClick }: { title: string, description: string, icon: React.ReactNode, comingSoon?: boolean, delay: number, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        {...{
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            whileHover: { scale: 1.05, y: -4 },
            whileTap: { scale: 0.98 },
            transition: { type: 'spring', stiffness: 400, damping: 20, delay: delay * 0.08 },
        } as any}
        disabled={comingSoon || !onClick}
        className="relative group aspect-square flex flex-col items-center justify-center p-3 bg-[var(--theme-card-bg)]/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] focus:ring-offset-[var(--theme-bg)] transition-all text-center overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="text-4xl mb-2 text-[var(--theme-primary)] drop-shadow-lg">
                {icon}
            </div>
            <h3 className="font-bold text-sm text-[var(--theme-text)]">{title}</h3>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-1 px-1">{description}</p>
        </div>
        {comingSoon && (
            <div className="absolute top-2 right-2 bg-[var(--theme-text-secondary)]/20 text-[var(--theme-text-secondary)] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                SOON
            </div>
        )}
    </motion.button>
);


const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, onNavigateToAnime, onNavigateToTopUp, onNavigateToMusicLibrary, onNavigateToStore, onNavigateToCollection, onNavigateToInfo, onNavigateToEarnXp, onNavigateToEvents }) => {
    
    const allTools = [
        {
            title: "Earn XP",
            description: "Complete tasks for rewards.",
            icon: <TrophyIcon />,
            onClick: onNavigateToEarnXp,
            comingSoon: false,
        },
        {
            title: "Top Up",
            description: "Purchase XP and redeem codes.",
            icon: '✨',
            onClick: onNavigateToTopUp,
            comingSoon: false,
        },
        {
            title: "The Bazaar",
            description: "Acquire new profile items.",
            icon: <StoreIcon />,
            onClick: onNavigateToStore,
            comingSoon: false,
        },
        {
            title: "My Satchel",
            description: "View your collected items.",
            icon: <CollectionIcon />,
            onClick: onNavigateToCollection,
            comingSoon: false,
        },
        {
            title: "Event Center",
            description: "Try your luck in special events.",
            icon: <TicketIcon />,
            onClick: onNavigateToEvents,
        },
         {
            title: "Music & GIFs",
            description: "Customize your profile.",
            icon: '🎵',
            onClick: onNavigateToMusicLibrary,
            comingSoon: false,
        },
        {
            title: "Watch Anime",
            description: "Stream your favorite series.",
            icon: '📺',
            onClick: onNavigateToAnime,
            comingSoon: false,
        },
        {
            title: "Guidebook",
            description: "Learn about rules & features.",
            icon: <InfoIcon />,
            onClick: onNavigateToInfo,
            comingSoon: false,
        },
        {
            title: "Gifting",
            description: "Send items to your friends.",
            icon: '🎁',
            comingSoon: true,
        },
    ];


    return (
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <header className="p-4 text-center sticky top-0 z-10 bg-[var(--theme-bg)]/80 backdrop-blur-lg border-b border-[var(--theme-secondary)]/30">
                <div className="relative flex items-center justify-center">
                    <button onClick={onBack} className="absolute left-0 text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                    <h1 className="text-2xl font-bold text-[var(--theme-text)]">Explorer's Kit</h1>
                </div>
                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Your hub for customization, rewards, and entertainment.</p>
            </header>

            <main className="p-4 grid grid-cols-2 gap-4">
                {allTools.map((tool, index) => (
                    <ToolCard
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