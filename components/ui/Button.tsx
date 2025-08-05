
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'relative group overflow-hidden rounded-lg px-6 py-2 font-bold text-white transition-all duration-300 ease-in-out shadow-md';
  
  const variantClasses = {
    primary: 'bg-accent hover:shadow-lg hover:shadow-accent/50',
    secondary: 'bg-primary-blue hover:shadow-lg hover:shadow-primary-blue/50',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20"></span>
      {/* Sheen effect */}
      <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -translate-x-full skew-x-[-15deg] transition-transform duration-500 group-hover:translate-x-full"></span>
    </button>
  );
};

export default Button;