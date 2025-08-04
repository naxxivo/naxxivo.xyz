
import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-md">
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <Link to="/admin" className="font-display text-xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent">
                    Admin
                </Link>
                <div className="w-8"></div> {/* Spacer */}
            </div>
        </header>
    );
};

export default AdminHeader;
