import React from 'react';
import { BackArrowIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';

interface EventsPageProps {
    onBack: () => void;
    onNavigateToLuckRoyale: () => void;
}

const EventCard = ({ title, description, icon, delay, comingSoon = false, onClick }: { title: string, description: string, icon: string, delay: number, comingSoon?: boolean, onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        disabled={!onClick}
        {...{
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            whileHover: { scale: onClick ? 1.03 : 1 },
            whileTap: { scale: onClick ? 0.98 : 1 },
            transition: { type: 'spring', stiffness: 300, damping: 20, delay: delay * 0.1 },
        } as any}
        className="relative bg-[var(--theme-card-bg)] rounded-2xl shadow-lg border border-white/10 overflow-hidden p-5 flex flex-col items-center text-center disabled:opacity-60 disabled:cursor-not-allowed"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-yellow-500/10 opacity-50"></div>
        <div className="relative z-10">
            <div className="text-5xl mb-3 drop-shadow-lg">{icon}</div>
            <h3 className="text-xl font-bold text-[var(--theme-text)]">{title}</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">{description}</p>
        </div>
        {comingSoon && (
            <div className="absolute top-3 right-3 bg-[var(--theme-text-secondary)]/20 text-[var(--theme-text-secondary)] text-xs font-bold px-2.5 py-1 rounded-full z-10">
                COMING SOON
            </div>
        )}
    </motion.button>
);

const EventsPage: React.FC<EventsPageProps> = ({ onBack, onNavigateToLuckRoyale }) => {
    
    const events = [
        {
            title: "Luck Royale",
            description: "Spend Gold to spin for exclusive profile covers and rare items.",
            icon: '🎰',
            onClick: onNavigateToLuckRoyale,
            comingSoon: false,
        },
        {
            title: "Diamond Spin",
            description: "Use your Diamonds for a chance to win premium, limited-edition rewards.",
            icon: '💎',
            comingSoon: true,
        },
        {
            title: "Treasure Hunt",
            description: "Complete daily clues and find hidden treasures around the app for big prizes.",
            icon: '🗺️',
            comingSoon: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--theme-bg)]">
            <header className="p-4 text-center sticky top-0 z-10 bg-[var(--theme-bg)]/80 backdrop-blur-lg border-b border-[var(--theme-secondary)]/30">
                <div className="relative flex items-center justify-center">
                    <button onClick={onBack} className="absolute left-0 text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                    <h1 className="text-2xl font-bold text-[var(--theme-text)]">Event Center</h1>
                </div>
                <p className="text-sm text-[var(--theme-text-secondary)] mt-1">Join special events and win exclusive rewards!</p>
            </header>

            <main className="p-4 space-y-4">
                {events.map((event, index) => (
                    <EventCard
                        key={event.title}
                        title={event.title}
                        description={event.description}
                        icon={event.icon}
                        delay={index}
                        onClick={event.onClick}
                        comingSoon={event.comingSoon}
                    />
                ))}
            </main>
        </div>
    );
};

export default EventsPage;