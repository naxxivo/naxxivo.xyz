import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin-pulse" // Use the new animation class
        >
            <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
            </defs>
            <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#spinner-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="94 150" // Dash to create the gap
                strokeDashoffset="0"
            />
        </svg>
    );
};

export default LoadingSpinner;