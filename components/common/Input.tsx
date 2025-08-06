import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    rightElement?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, rightElement, ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    {...props}
                    className="appearance-none block w-full px-4 py-3 bg-[var(--theme-card-bg-alt)] border-transparent border rounded-lg text-[var(--theme-text)] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)] focus:border-transparent sm:text-sm transition-all duration-300"
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;