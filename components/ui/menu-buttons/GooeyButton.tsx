import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const GooeyButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className="w-16 h-16 bg-gradient-to-br from-primary-pink to-primary-blue text-white flex items-center justify-center shadow-xl focus:outline-none z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ borderRadius: "50%" }}
            animate={{
                borderRadius: isOpen ? "35% 65% 35% 65% / 45% 45% 55% 55%" : "50%",
            }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
             <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
                <PlusIcon className="h-8 w-8" />
            </motion.div>
        </motion.button>
    );
};

export default GooeyButton;
