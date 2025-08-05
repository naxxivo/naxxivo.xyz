import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'large' | 'small';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'large', ...props }) => {
    const baseClasses = "w-full flex justify-center items-center font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300";
    
    const variantClasses = {
        primary: "text-white bg-violet-500 hover:bg-violet-600 shadow-md hover:shadow-lg disabled:bg-violet-300 disabled:shadow-none disabled:cursor-not-allowed",
        secondary: "text-violet-600 bg-white border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-400 focus:ring-violet-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
    };
    
    const sizeClasses = {
        large: "py-3 px-6 text-base",
        small: "py-2 px-4 text-sm"
    };

    const motionProps = props.disabled ? {} : {
        whileHover: { scale: 1.03, y: -2 },
        whileTap: { scale: 0.98, y: 0 },
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
