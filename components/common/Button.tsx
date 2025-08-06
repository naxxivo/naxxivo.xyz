import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'large' | 'small';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'large', ...props }) => {
    const baseClasses = "w-full flex justify-center items-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#100F1F] transition-colors duration-200";
    
    const variantClasses = {
        primary: "text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed",
        secondary: "text-gray-300 bg-transparent border border-gray-600 hover:bg-blue-500/10 hover:border-blue-500 hover:text-white focus:ring-blue-500 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
    };
    
    const sizeClasses = {
        large: "py-3 px-6 text-base",
        small: "py-2 px-4 text-sm"
    };

    const motionProps = props.disabled ? {} : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.9 },
        transition: { type: 'spring', stiffness: 400, damping: 17 } as const,
    };

    return (
        <motion.button
            {...motionProps}
            {...props}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;