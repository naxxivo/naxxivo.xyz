import React from 'react';
import { motion } from 'framer-motion';

export const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.411 7.91 29.517 6 24 6C13.438 6 5 14.438 5 25s8.438 19 19 19s19-8.438 19-19c0-1.897-.281-3.72-.789-5.417z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.524-5.487C34.411 7.91 29.517 6 24 6C16.312 6 9.613 9.945 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.779-1.938 13.048-5.186l-6.44-5.023c-2.183 1.6-4.96 2.6-8.608 2.6c-5.223 0-9.659-3.337-11.303-8H6.306C9.613 38.055 16.312 42 24 42z"/>
    <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.237 4.138-4.398 5.591l6.44 5.023C40.086 35.61 44 29.863 44 24c0-1.897-.281-3.72-.789-5.417z"/>
  </svg>
);

export const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);

export const AbstractShape = () => (
    <motion.div
      className="absolute -top-16 -right-16 w-64 h-64"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ type: 'spring', stiffness: 50, duration: 20, repeat: Infinity, repeatType: 'reverse' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full opacity-30 blur-2xl animate-float"></div>
      <div className="absolute inset-8 bg-gradient-to-tl from-yellow-200 to-purple-400 rounded-full opacity-40 blur-xl animate-float" style={{animationDelay: '-2s'}}></div>
    </motion.div>
);