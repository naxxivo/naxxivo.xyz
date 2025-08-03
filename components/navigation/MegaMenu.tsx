
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useNavMenu from '@/components/ui/hooks/useNavMenu';

interface MegaMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, setIsOpen }) => {
    const menuItems = useNavMenu();

    // Example of categorizing items for a mega menu.
    // In a real scenario, this logic might be more complex.
    const primaryActions = menuItems.slice(0, 4);
    const browseContent = menuItems.filter(item => ['Anime', 'Marketplace', 'Health Hub', 'Shorts'].includes(item.label));
    const community = menuItems.filter(item => ['Users', 'Messages'].includes(item.label));
    const account = menuItems.filter(item => ['Profile', 'Settings', 'Admin Panel', 'Notifications'].includes(item.label));

    const renderCategory = (title: string, items: typeof menuItems) => (
        <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-secondary-purple/60 dark:text-dark-text/60 px-4 mb-2">{title}</h3>
            <ul className="space-y-1">
                {items.map(item => (
                    <li key={item.label}>
                        <Link to={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors">
                            <item.icon className="h-6 w-6 text-accent flex-shrink-0" />
                            <span className="font-semibold">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute top-16 left-0 right-0 z-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {renderCategory('Primary', primaryActions)}
                                {renderCategory('Browse', browseContent)}
                                {renderCategory('Community', community)}
                                {renderCategory('Account', account)}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MegaMenu;
