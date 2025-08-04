
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useNavMenu from '@/components/ui/hooks/useNavMenu.ts';

interface TVMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const TVMenu: React.FC<TVMenuProps> = ({ isOpen, setIsOpen }) => {
    const menuItems = useNavMenu();
    const navigate = useNavigate();
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                setIsOpen(false);
                return;
            }

            const focusableElements = Array.from(gridRef.current?.querySelectorAll('a') || []) as HTMLElement[];
            if (focusableElements.length === 0) return;

            const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
            
            let nextIndex = -1;

            switch(e.key) {
                case 'ArrowRight':
                    nextIndex = (currentIndex + 1) % focusableElements.length;
                    break;
                case 'ArrowLeft':
                    nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                    break;
                // Simple up/down, can be improved with column logic
                case 'ArrowDown':
                     // Assuming 4 columns for this logic
                    nextIndex = Math.min(currentIndex + 4, focusableElements.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = Math.max(currentIndex - 4, 0);
                    break;
                case 'Enter':
                    if(document.activeElement instanceof HTMLAnchorElement) {
                       (document.activeElement as HTMLAnchorElement).click();
                    }
                    break;
            }

            if (nextIndex !== -1) {
                e.preventDefault();
                focusableElements[nextIndex].focus();
            }
        };

        if (isOpen && gridRef.current) {
            (gridRef.current.querySelector('a') as HTMLElement)?.focus();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);

    }, [isOpen, setIsOpen, navigate, menuItems.length]);


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-center justify-center p-8"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        ref={gridRef}
                        onClick={(e) => e.stopPropagation()}
                        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8"
                    >
                        {menuItems.map(item => (
                            <Link
                                to={item.href}
                                key={item.label}
                                onClick={() => setIsOpen(false)}
                                className="group flex flex-col items-center justify-center gap-4 p-6 bg-white/10 rounded-2xl aspect-square text-white transition-all duration-300 transform-gpu focus:outline-none focus:ring-4 focus:ring-accent focus:scale-110 hover:bg-white/20 hover:scale-105"
                            >
                                <item.icon className="w-16 h-16 transition-transform group-hover:scale-110 group-focus:scale-110" />
                                <span className="font-bold text-xl text-center">{item.label}</span>
                            </Link>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TVMenu;