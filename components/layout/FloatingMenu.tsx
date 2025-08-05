

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HomeIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, UserCircleIcon, 
    Cog6ToothIcon, PlusIcon, XMarkIcon, TvIcon, ShoppingBagIcon, FilmIcon,
    ArrowRightCircleIcon, ArrowLeftCircleIcon, ShieldCheckIcon
} from '@heroicons/react/24/solid';

interface MenuItem {
    href?: string;
    icon: React.ElementType;
    label: string;
    action?: () => void;
    adminOnly?: boolean;
}

interface FloatingMenuItemProps {
    item: MenuItem;
    index: number;
    totalItems: number;
    radius: number;
}

const FloatingMenuItem: React.FC<FloatingMenuItemProps> = ({ item, index, totalItems, radius }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Distribute items in a 90-degree arc (from 180 to 270 degrees)
    const angle = Math.PI + (Math.PI / 2) * (index / (totalItems - 1));
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    const isActive = item.href ? location.pathname.startsWith(item.href) : false;

    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x, y }}
            exit={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: index * 0.05 }}
            className="absolute group"
        >
            <div
                onClick={() => {
                    if (item.action) item.action();
                    if (item.href) navigate(item.href);
                }}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg
                ${isActive ? 'bg-accent text-white scale-110' : 'bg-white dark:bg-dark-card text-secondary-purple dark:text-dark-text hover:bg-accent hover:text-white'}`}
            >
                <item.icon className="h-7 w-7" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1 bg-dark-bg text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {item.label}
            </div>
        </motion.div>
    );
    return content;
};


const FloatingMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const { user } = useAuth();
    
    if (!user) {
        return null;
    }

    const allMenuItems: MenuItem[][] = [
        // Page 1: Content
        [
            { href: '/', icon: HomeIcon, label: 'Home' },
            { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
            { href: '/anime', icon: TvIcon, label: 'Anime' },
            { href: '/market', icon: ShoppingBagIcon, label: 'Marketplace' },
            { action: () => setPageIndex(1), icon: ArrowRightCircleIcon, label: 'More...' }
        ],
        // Page 2: Social & Account
        [
            { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
            { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
            { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
            { href: '/users', icon: UserGroupIcon, label: 'Users' },
            { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
            { href: '/admin', icon: ShieldCheckIcon, label: 'Admin Panel', adminOnly: true },
            { action: () => setPageIndex(0), icon: ArrowLeftCircleIcon, label: 'Back' }
        ]
    ];
    
    const menuPages = allMenuItems.map(page => 
        page.filter(item => !item.adminOnly || (item.adminOnly && user.role === 'admin'))
    );
    
    const toggleMenu = () => {
      if(isOpen) {
        // If closing, always reset to the first page for next time
        setTimeout(() => setPageIndex(0), 200);
      }
      setIsOpen(!isOpen);
    }

    const currentItems = menuPages[pageIndex] || [];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
            <AnimatePresence>
                {isOpen && (
                    // Use key to force re-render and re-animate when pageIndex changes
                    <motion.div key={pageIndex} className="relative">
                        {currentItems.map((item, index) => (
                            <FloatingMenuItem
                                key={item.label}
                                item={item}
                                index={index}
                                totalItems={currentItems.length}
                                radius={120}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                style={{ animation: !isOpen ? 'bob 3s ease-in-out infinite' : 'none' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary-coral text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'x' : 'plus'}
                        initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? <XMarkIcon className="h-8 w-8" /> : <PlusIcon className="h-8 w-8" />}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default FloatingMenu;