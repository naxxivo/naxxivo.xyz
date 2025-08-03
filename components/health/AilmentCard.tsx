

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import type { Ailment } from '@/components/ui/data/healthData';

interface AilmentCardProps {
  ailment: Ailment;
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

const AilmentCard: React.FC<AilmentCardProps> = ({ ailment }) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={itemVariants}>
      <Link to={`/health/${ailment.id}`}>
        <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-blue/30 dark:hover:shadow-accent/20 will-change-transform text-center h-full flex flex-col items-center justify-center">
          <div className="mb-4 p-4 bg-accent/20 rounded-full">
            <ailment.icon className="h-10 w-10 text-accent" />
          </div>
          <h3 className="font-bold text-xl text-secondary-purple dark:text-dark-text mb-2">{ailment.name}</h3>
          <p className="text-sm text-secondary-purple/80 dark:text-dark-text/80">{ailment.description}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default AilmentCard;