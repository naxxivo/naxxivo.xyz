import React from 'react';
import { BackArrowIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';

interface ToolsPageProps {
    onBack: () => void;
    onNavigateToAnime: () => void;
    onNavigateToTopUp: () => void;
}

const ToolCard = ({ title, description, icon, comingSoon, delay, onClick }: { title: string, description: string, icon: string, comingSoon?: boolean, delay: number, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', delay: delay * 0.1 }}
        disabled={comingSoon || !onClick}
        className={`w-full text-left bg-white p-6 rounded-2xl shadow-md overflow-hidden relative ${comingSoon || !onClick ? 'cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500'}`}
    >
        {comingSoon && (
            <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                SOON
            </div>
        )}
        <div className={`text-4xl mb-4 ${comingSoon ? 'opacity-40' : ''}`}>{icon}</div>
        <h3 className={`font-bold text-lg text-gray-800 ${comingSoon ? 'opacity-40' : ''}`}>{title}</h3>
        <p className={`text-sm text-gray-500 mt-1 ${comingSoon ? 'opacity-40' : ''}`}>{description}</p>
    </motion.button>
);

const ToolsPage: React.FC<ToolsPageProps> = ({ onBack, onNavigateToAnime, onNavigateToTopUp }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Tools & Features</h1>
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
                    title="Album"
                    description="Organize your memories into albums."
                    icon="🖼️"
                    comingSoon
                    delay={3}
                />
                <ToolCard
                    title="Health Hub"
                    description="Track your wellness and fitness goals."
                    icon="❤️‍🩹"
                    comingSoon
                    delay={4}
                />
                 <ToolCard
                    title="More Coming Soon"
                    description="We're always working on new features."
                    icon="🚀"
                    comingSoon
                    delay={5}
                />
            </main>
        </div>
    );
};

export default ToolsPage;
