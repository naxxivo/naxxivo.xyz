import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HomeIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, UserCircleIcon, 
    Cog6ToothIcon, TvIcon, FilmIcon, TrophyIcon, ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { useTheme } from '../theme/ThemeProvider';
import { menuButtonComponents } from '../ui/menu-buttons';

interface MenuItem {
    href: string;
    icon: React.ElementType;
    label: string;
    adminOnly?: boolean;
}

interface FloatingMenuItemProps {
    item: MenuItem;
    index: number;
    totalItems: number;
    radius: number;
    onNavigate: () => void;
}

const FloatingMenuItem: React.FC<FloatingMenuItemProps> = ({ item, index, totalItems, radius, onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    // A 140-degree arc from a bit above 'left' to 'down'. (160 to 300 degrees)
    // This creates a nice fan in the top-left direction from the button's position.
    const startAngle = 160 * (Math.PI / 180);
    const totalAngle = 140 * (Math.PI / 180);
    const finalAngle = startAngle + (totalItems > 1 ? (index / (totalItems - 1)) * totalAngle : 0);
    const x = radius * Math.cos(finalAngle);
    const y = radius * Math.sin(finalAngle);

    const isActive = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x, y }}
            exit={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: (index * 0.04) }}
            className="absolute"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.button
                onClick={() => {
                    navigate(item.href);
                    onNavigate();
                }}
                whileHover={{ scale: 1.2, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
                whileTap={{ scale: 1.1 }}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-lg
                ${isActive ? 'bg-accent text-white scale-110' : 'bg-white dark:bg-dark-card text-secondary-purple dark:text-dark-text hover:bg-accent hover:text-white'}`}
                aria-label={item.label}
            >
                <item.icon className="h-7 w-7" />
            </motion.button>
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1 bg-dark-bg text-white text-xs rounded-md pointer-events-none z-10"
                    >
                        {item.label}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FloatingMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { menuButtonStyle } = useTheme();
    
    if (!user) {
        return null;
    }

    const allMenuItems: MenuItem[] = [
        { href: '/', icon: HomeIcon, label: 'Home' },
        { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
        { href: '/anime', icon: TvIcon, label: 'Anime' },
        { href: '/leaderboard', icon: TrophyIcon, label: 'Leaderboard' },
        { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
        { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
        { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
        { href: '/users', icon: UserGroupIcon, label: 'Users' },
        { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
        { href: '/admin', icon: ShieldCheckIcon, label: 'Admin Panel', adminOnly: true },
    ];
    
    const menuItems = allMenuItems.filter(item => !item.adminOnly || (item.adminOnly && user.role === 'admin'));
    
    const MenuButtonComponent = menuButtonComponents[menuButtonStyle] || menuButtonComponents.default;
    
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
            <AnimatePresence>
                {isOpen && (
                    <motion.div className="relative">
                        {menuItems.map((item, index) => (
                            <FloatingMenuItem
                                key={item.label}
                                item={item}
                                index={index}
                                totalItems={menuItems.length}
                                radius={130}
                                onNavigate={toggleMenu}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <MenuButtonComponent isOpen={isOpen} onClick={toggleMenu} />
        </div>
    );
};

export default FloatingMenu;