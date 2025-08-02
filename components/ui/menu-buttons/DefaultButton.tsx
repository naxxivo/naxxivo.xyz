import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const DefaultButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
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
    );
};

export default DefaultButton;
