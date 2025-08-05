import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'large' | 'small';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'large', ...props }) => {
    const baseClasses = "w-full flex justify-center items-center font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#100F1F] transition-colors duration-200";
    
    const variantClasses = {
        primary: "text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-500 disabled:bg-yellow-300 disabled:cursor-not-allowed",
        secondary: "text-yellow-400 bg-transparent border-2 border-yellow-400 hover:bg-yellow-400 hover:text-gray-900 focus:ring-yellow-500 disabled:border-yellow-300 disabled:text-yellow-300 disabled:cursor-not-allowed"
    };
    
    const sizeClasses = {
        large: "py-3 px-4 text-base",
        small: "py-2 px-3 text-sm"
    };

    return (
        <button
            {...props}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;