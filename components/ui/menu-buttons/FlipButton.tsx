import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const FlipButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10"
            style={{ perspective: '1000px' }}
        >
            <motion.div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d', position: 'absolute' }}
                animate={{ rotateY: isOpen ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                {/* Front face */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-accent to-secondary-coral flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                    <PlusIcon className="h-8 w-8" />
                </div>
                {/* Back face */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-primary-blue to-secondary-purple flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <XMarkIcon className="h-8 w-8" />
                </div>
            </motion.div>
        </motion.button>
    );
};

export default FlipButton;
