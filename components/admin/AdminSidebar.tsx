
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    NewspaperIcon,
    ShoppingBagIcon,
    ArrowLeftOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';

interface AdminSidebarProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setOpen }) => {
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
            isActive
                ? 'bg-accent text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-accent/20 hover:text-accent dark:hover:text-white'
        }`;

    return (
        <aside className={`fixed md:relative inset-y-0 left-0 z-50 bg-white dark:bg-dark-card shadow-lg flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out transform ${isOpen ? 'w-64 translate-x-0' : 'w-64 md:w-20 -translate-x-full md:translate-x-0'}`}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 h-16">
                <Link to="/admin" className={`font-display text-2xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:invisible'}`}>
                    Admin Panel
                </Link>
                <button onClick={() => setOpen(!isOpen)} className="hidden md:block p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-bg">
                    {isOpen ? <ChevronDoubleLeftIcon className="h-6 w-6"/> : <ChevronDoubleRightIcon className="h-6 w-6"/>}
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                <NavLink to="/admin" end className={navLinkClasses}>
                    <ChartBarIcon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:invisible'}`}>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClasses}>
                    <UsersIcon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:invisible'}`}>Users</span>
                </NavLink>
                <NavLink to="/admin/posts" className={navLinkClasses}>
                    <NewspaperIcon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:invisible'}`}>Posts</span>
                </NavLink>
            </nav>
            <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                 <Link to="/" className="flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:invisible'}`}>Exit Admin</span>
                 </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
