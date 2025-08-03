
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useNavMenu from '@/components/ui/hooks/useNavMenu';

interface ThreeDotMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ isOpen, setIsOpen }) => {
    const menuItems = useNavMenu();

    const navLinkClasses = (isActive: boolean) =>
        `flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 rounded-md ${isActive ? 'bg-accent text-white' : 'text-secondary-purple dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg'}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-16 right-4 mt-2 z-50 w-56 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-2xl p-2"
                >
                    <ul className="space-y-1">
                        {menuItems.map(item => (
                            <li key={item.label}>
                                <NavLink to={item.href} className={({ isActive }) => navLinkClasses(isActive)} onClick={() => setIsOpen(false)} end={item.href === '/'}>
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ThreeDotMenu;
