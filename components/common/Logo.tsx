import React from 'react';
import { motion, Variants } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const letter: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 },
  },
};

const Logo = () => {
    const text = "NAXXIVO";
    return (
        <motion.h1
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex overflow-hidden font-black text-4xl tracking-tighter text-white"
          aria-label={text}
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              variants={letter}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
    );
};

export default Logo;