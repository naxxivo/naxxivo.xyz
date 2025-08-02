import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const SlideButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10 overflow-hidden"
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={isOpen ? 'x' : 'plus'}
                    initial={{ x: isOpen ? -30 : 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: isOpen ? 30 : -30, opacity: 0 }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    className="absolute"
                >
                    {isOpen ? <XMarkIcon className="h-8 w-8" /> : <PlusIcon className="h-8 w-8" />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

export default SlideButton;
