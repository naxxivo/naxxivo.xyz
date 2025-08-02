import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';

interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const Sparkle: React.FC<{i: number}> = ({i}) => {
    const angle = (i / 6) * 2 * Math.PI;
    const radius = 40;
    return (
        <motion.div
            className="absolute w-2 h-2 bg-primary-yellow rounded-full"
            style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{
                x: `${Math.cos(angle) * radius}px`,
                y: `${Math.sin(angle) * radius}px`,
                scale: [0.5, 1.2, 0],
                opacity: [1, 1, 0]
            }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: Math.random() * 0.2 }}
        />
    )
}

const SparkleButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
        <motion.button
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-yellow to-secondary-coral text-white flex items-center justify-center shadow-xl focus:outline-none relative z-10"
        >
            <AnimatePresence>
            {isHovered && [...Array(6)].map((_, i) => <Sparkle key={i} i={i} />)}
            </AnimatePresence>
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
                <PlusIcon className="h-8 w-8" />
            </motion.div>
        </motion.button>
    );
};

export default SparkleButton;
