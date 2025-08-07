import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
    const text = "Naxxivo";
    return (
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-logo text-5xl text-gray-800"
          aria-label={text}
        >
          {text}
        </motion.h1>
    );
};

export default Logo;