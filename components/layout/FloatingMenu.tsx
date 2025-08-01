import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import { 
    HomeIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, UserCircleIcon, 
    Cog6ToothIcon, TvIcon, ShoppingBagIcon, FilmIcon,
    ShieldCheckIcon, HeartIcon, PlusIcon, XMarkIcon
} from '@heroicons/react/24/solid';

const FloatingMenu: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const menuItems = user ? [
        { href: '/', icon: HomeIcon, label: 'Home' },
        { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
        { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
        { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
        { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
        { href: '/anime', icon: TvIcon, label: 'Anime' },
        { href: '/market', icon: ShoppingBagIcon, label: 'Marketplace' },
        { href: '/health', icon: HeartIcon, label: 'Health Hub' },
        { href: '/users', icon: UserGroupIcon, label: 'Users' },
        { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
        ...(user.role === 'admin' ? [{ href: '/admin', icon: ShieldCheckIcon, label: 'Admin Panel' }] : [])
    ] : [];
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    if (!user) return null;

    const navLinkClasses = (isActive: boolean) => 
        `flex items-center w-full p-3 pl-4 rounded-lg text-base font-semibold transition-all duration-200 
        ${isActive 
            ? 'bg-accent text-white shadow-md' 
            : 'text-secondary-purple dark:text-dark-text hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-accent'}`
        ;

    const menuContainerVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                when: "beforeChildren",
                staggerChildren: 0.05
            }
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div ref={menuRef} className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute bottom-20 right-0 w-64 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-2xl p-2"
                    >
                       <div className="max-h-96 overflow-y-auto custom-scrollbar pr-1">
                            <ul className="space-y-1">
                                {menuItems.map(item => (
                                    <motion.li key={item.label} variants={menuItemVariants}>
                                        <NavLink to={item.href} className={({isActive}) => navLinkClasses(isActive)} end>
                                            <item.icon className="h-6 w-6 mr-4 flex-shrink-0" />
                                            {item.label}
                                        </NavLink>
                                    </motion.li>
                                ))}
                            </ul>
                       </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/50"
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={isOpen ? 'x' : 'plus'}
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: 90, scale: 0 }}
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