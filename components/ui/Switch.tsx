
import React from 'react';
import { motion, Transition } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  const spring: Transition = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
  };

  return (
    <button
      className={`relative flex items-center w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? 'bg-accent justify-end' : 'bg-gray-400 dark:bg-dark-bg justify-start'
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={spring}
      />
    </button>
  );
};

export default Switch;
