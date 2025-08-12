// eventspage.tsx
import React from 'react';
import { BackArrowIcon } from '../common/AppIcons';
import { motion } from 'framer-motion';
import { LuckRoyaleIcon, DiamondSpinIcon, TreasureHuntIcon } from '../common/EventIcons';

interface EventsPageProps {
    onBack: () => void;
    onNavigateToLuckRoyale: () => void;
}

const EventCard = ({ 
    title, 
    description, 
    icon, 
    delay, 
    comingSoon = false, 
    onClick, 
    bgGradient 
}: { 
    title: string, 
    description: string, 
    icon: React.ReactNode, 
    delay: number, 
    comingSoon?: boolean, 
    onClick?: () => void, 
    bgGradient: string 
}) => (
    <motion.button
        onClick={onClick}
        disabled={comingSoon || !onClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: onClick ? 1.03 : 1 }}
        whileTap={{ scale: onClick ? 0.98 : 1 }}
        transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 20, 
            delay: delay * 0.1 
        }}
        className="relative w-full aspect-[4/3] rounded-2xl shadow-lg overflow-hidden p-5 flex flex-col justify-end text-left text-white disabled:opacity-60 disabled:cursor-not-allowed group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-all duration-500 group-hover:scale-110 group-hover:brightness-110`} />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10" />
        <div className="absolute inset-0 bg-noise opacity-10" />

        <div className="relative z-10">
            <div className="text-5xl mb-2 drop-shadow-lg flex justify-start">{icon}</div>
            <h3 className="text-xl font-bold tracking-wide">{title}</h3>
            <p className="text-sm text-white/90 mt-2">{description}</p>
        </div>
        
        {comingSoon && (
            <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: delay * 0.1 + 0.3 }}
                className="absolute top-3 right-3 bg-black/40 text-white/90 text-xs font-bold px-3 py-1 rounded-full z-10 backdrop-blur-sm border border-white/10"
            >
                COMING SOON
            </motion.div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: delay * 0.1 }}
                className="h-full bg-white/50"
            />
        </div>
    </motion.button>
);

const EventsPage: React.FC<EventsPageProps> = ({ onBack, onNavigateToLuckRoyale }) => {
    const events = [
        {
            title: "Luck Royale",
            description: "Spin for exclusive profile covers and rare items with dazzling effects",
            icon: <LuckRoyaleIcon className="w-12 h-12" />,
            onClick: onNavigateToLuckRoyale,
            comingSoon: false,
            bgGradient: 'from-purple-600 via-indigo-600 to-blue-600',
        },
        {
            title: "Diamond Spin",
            description: "Premium, limited-edition rewards with sparkling animations",
            icon: <DiamondSpinIcon className="w-12 h-12" />,
            comingSoon: true,
            bgGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
        },
        {
            title: "Treasure Hunt",
            description: "Find hidden treasures with immersive discovery effects",
            icon: <TreasureHuntIcon className="w-12 h-12" />,
            comingSoon: true,
            bgGradient: 'from-yellow-600 via-orange-600 to-amber-600',
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
        >
            <header className="p-4 text-center sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-purple-500/20">
                <div className="relative flex items-center justify-center">
                    <motion.button 
                        onClick={onBack} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute left-0 text-purple-300 hover:text-white"
                    >
                        <BackArrowIcon />
                    </motion.button>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    >
                        Event Center
                    </motion.h1>
                </div>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-purple-200/80 mt-1"
                >
                    Join special events and win exclusive rewards!
                </motion.p>
            </header>

            <main className="p-4 grid grid-cols-2 gap-4">
                {events.map((event, index) => (
                    <EventCard
                        key={event.title}
                        title={event.title}
                        description={event.description}
                        icon={event.icon}
                        delay={index}
                        onClick={event.onClick}
                        comingSoon={event.comingSoon}
                        bgGradient={event.bgGradient}
                    />
                ))}
            </main>
        </motion.div>
    );
};

export default EventsPage;
