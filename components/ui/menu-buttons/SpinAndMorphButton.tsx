import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const SpinAndMorphButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-blue to-secondary-purple text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10 overflow-hidden"
        >
            <AnimatePresence mode="wait">
                 <motion.div
                    key={isOpen ? 'x' : 'cog'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute"
                >
                    {isOpen ? <XMarkIcon className="h-8 w-8" /> : <Cog6ToothIcon className="h-8 w-8" />}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

export default SpinAndMorphButton;
