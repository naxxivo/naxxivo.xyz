import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// The original interface was missing standard button attributes.
// This new interface extends React.ButtonHTMLAttributes<HTMLButtonElement> to include them.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'large' | 'small';
}

const Button: React.FC<ButtonProps & HTMLMotionProps<"button">> = ({ children, className, variant = 'primary', size = 'large', ...props }) => {
    const baseClasses = "w-full flex justify-center items-center font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-ring)] dark:focus:ring-offset-[var(--theme-bg)] transition-all duration-300";
    
    const variantClasses = {
        primary: "text-[var(--theme-primary-text)] bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] shadow-md hover:shadow-lg disabled:bg-opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
        secondary: "text-[var(--theme-secondary-text)] bg-[var(--theme-card-bg)] border-2 border-[var(--theme-secondary)] hover:bg-[var(--theme-secondary-hover)] hover:border-[var(--theme-text-secondary)] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed dark:bg-transparent dark:hover:bg-[var(--theme-secondary-hover)] dark:hover:text-white"
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