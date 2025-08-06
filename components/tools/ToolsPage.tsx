import React from 'react';
import { BackArrowIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';

interface ToolsPageProps {
    onBack: () => void;
    onNavigateToAnime: () => void;
    onNavigateToTopUp: () => void;
    onNavigateToMusicLibrary: () => void;
}

const ToolCard = ({ title, description, icon, comingSoon, delay, onClick }: { title: string, description: string, icon: string, comingSoon?: boolean, delay: number, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', delay: delay * 0.1 }}
        disabled={comingSoon || !onClick}
        className={`w-full text-left bg-[var(--theme-card-bg)] p-6 rounded-2xl shadow-md overflow-hidden relative ${comingSoon || !onClick ? 'cursor-not-allowed' : 'hover:bg-opacity-80 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]'}`}
    >
        {comingSoon && (
            <div className="absolute top-2 right-2 bg-[var(--theme-text-secondary)]/20 text-[var(--theme-text-secondary)] text-xs font-semibold px-2 py-1 rounded-full">
                SOON
            </div>
        )}
        <div className={`text-4xl mb-4 ${comingSoon ? 'opacity-40' : ''}`}>{icon}</div>
        <h3 className={`font-bold text-lg text-[var(--theme-text)] ${comingSoon ? 'opacity-40' : ''}`}>{title}</h3>
        <p className={`text-sm text-[var(--theme-text-secondary)] mt-1 ${comingSoon ? 'opacity-40' : ''}`}>{description}</p>
    </motion.button>
);

const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, onNavigateToAnime, onNavigateToTopUp, onNavigateToMusicLibrary }) => {
    return (
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <header className="flex items-center p-4 border-b border-black/10 dark:border-white/10 bg-[var(--theme-card-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-text)] mx-auto">Tools & Features</h1>
                 {/* Placeholder for centering */}
                <div className="w-6"></div>
            </header>

            <main className="p-4 space-y-4">
                <ToolCard
                    title="Watch Anime"
                    description="Stream your favorite anime series."
                    icon="📺"
                    delay={1}
                    onClick={onNavigateToAnime}
                />
                <ToolCard
                    title="Top Up XP"
                    description="Purchase XP to level up your profile."
                    icon="✨"
                    delay={2}
                    onClick={onNavigateToTopUp}
                />
                <ToolCard
                    title="Music Library"
                    description="Browse and set your profile music."
                    icon="🎵"
                    delay={3}
                    onClick={onNavigateToMusicLibrary}
                />
                <ToolCard
                    title="Album"
                    description="Organize your memories into albums."
                    icon="🖼️"
                    comingSoon
                    delay={4}
                />
                <ToolCard
                    title="Health Hub"
                    description="Track your wellness and fitness goals."
                    icon="❤️‍🩹"
                    comingSoon
                    delay={5}
                />
                 <ToolCard
                    title="More Coming Soon"
                    description="We're always working on new features."
                    icon="🚀"
                    comingSoon
                    delay={6}
                />
            </main>
        </div>
    );
};

export default ToolsPage;