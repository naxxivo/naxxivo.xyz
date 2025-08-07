import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    rightElement?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, rightElement, ...props }) => {
    return (
        <div className="relative">
            <input
                id={id}
                {...props}
                placeholder=" " 
                className="block w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[var(--theme-input-border)] text-[var(--theme-text)] placeholder-transparent focus:outline-none focus:ring-0 focus:border-[var(--theme-primary)] peer sm:text-sm transition-colors duration-300"
            />
             <label 
                htmlFor={id} 
                className="absolute text-sm text-[var(--theme-text-secondary)] duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[var(--theme-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
                {label}
            </label>
            {rightElement && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
    );
};

export default Input;