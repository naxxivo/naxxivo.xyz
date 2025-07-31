
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, CloudArrowUpIcon, UserGroupIcon, ChatBubbleLeftRightIcon, UserCircleIcon, Cog6ToothIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

const FloatingMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return null;
    }

    const menuItems = [
        { href: '/', icon: HomeIcon, label: 'Home' },
        { href: '/users', icon: UserGroupIcon, label: 'Users' },
        { href: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
        { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
        { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
        { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];

    const menuVariants = {
        closed: { opacity: 0, y: 20, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
        open: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        closed: { opacity: 0, x: -20 },
        open: { opacity: 1, x: 0 },
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="absolute bottom-20 right-0 w-52 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-2xl shadow-primary-blue/30 overflow-hidden"
                    >
                        <ul className="py-2">
                            {menuItems.map((item) => (
                                <motion.li key={item.href} variants={itemVariants}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 w-full text-left transition-colors ${
                                            location.pathname === item.href ? 'text-accent font-bold bg-accent/10' : 'text-secondary-purple dark:text-dark-text hover:bg-accent/10'
                                        }`}
                                    >
                                        <item.icon className="h-6 w-6" />
                                        <span>{item.label}</span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{ animation: !isOpen ? 'bob 3s ease-in-out infinite' : 'none' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary-coral text-white flex items-center justify-center shadow-xl focus:outline-none"
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