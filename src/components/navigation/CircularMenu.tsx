
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/App.tsx';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useNavMenu from '@/components/ui/hooks/useNavMenu.ts';

const CircularMenu: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const menuItems = useNavMenu();
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    if (!user) return null;

    const radius = 120; // The radius of the circle menu

    return (
        <div ref={menuRef} className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
            {isOpen && menuItems.map((item, i) => {
                const angle = (i * 360) / menuItems.length - 90; // Calculate angle for each item
                const x = radius * Math.cos(angle * (Math.PI / 180));
                const y = radius * Math.sin(angle * (Math.PI / 180));

                return (
                    <motion.div
                        key={item.label}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x: x, y: y, scale: 1, opacity: 1 }}
                        exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.03 }}
                        className="absolute bottom-5 right-5"
                    >
                        <NavLink 
                            to={item.href}
                            title={item.label}
                            className={({isActive}) => `w-12 h-12 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-colors ${isActive ? 'text-accent' : 'text-secondary-purple dark:text-dark-text hover:text-accent'}`}
                        >
                            <item.icon className="h-6 w-6" />
                        </NavLink>
                    </motion.div>
                );
            })}
            </AnimatePresence>
            
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/50 transform transition-transform hover:scale-110 active:scale-90"
                whileTap={{ scale: 0.9 }}
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

export default CircularMenu;