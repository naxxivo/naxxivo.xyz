import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const PulseButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10"
        >
             <motion.div
                className="absolute inset-0 rounded-full bg-accent/30 z-[-1]"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                <PlusIcon className="h-8 w-8" />
            </motion.div>
        </motion.button>
    );
};

export default PulseButton;
