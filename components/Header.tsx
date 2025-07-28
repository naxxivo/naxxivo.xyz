import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAvatarUrl, pb } from '../services/pocketbase';
import { HomeIcon } from './icons/HomeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { useTheme } from '../hooks/useTheme';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { BellIcon } from './icons/BellIcon';

const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `p-2 rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-border hover:text-text-primary'}`
        }
    >
        {children}
    </NavLink>
);

const NotificationBell: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const fetchInitialCount = async () => {
            try {
                const result = await pb.collection('notifications').getList(1, 1, {
                    filter: `user = "${user.id}" && read = false`,
                    requestKey: 'header-notif-count'
                });
                setUnreadCount(result.totalItems);
            } catch (err) {
                console.error("Failed to fetch notification count:", err);
            }
        };

        fetchInitialCount();

        const unsubscribe = pb.collection('notifications').subscribe('*', (e) => {
            if (e.record.user === user.id) {
               fetchInitialCount(); // Re-fetch count on any change for simplicity
            }
        });

        return () => {
            pb.collection('notifications').unsubscribe('*');
        };
    }, [isAuthenticated, user]);

    return (
        <NavItem to="/notifications">
            <div className="relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
                )}
            </div>
        </NavItem>
    );
};


export const Header: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-surface shadow-md sticky top-0 z-30">
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <span>Naxxivo</span>
                </Link>

                <div className="flex-1 flex justify-center">
                    {isAuthenticated && (
                        <div className="flex items-center space-x-2 sm:space-x-4 bg-background p-1 rounded-lg">
                            <NavItem to="/"><HomeIcon className="w-6 h-6" /></NavItem>
                            <NavItem to="/search"><SearchIcon className="w-6 h-6" /></NavItem>
                            <NavItem to="/users"><span className="px-2 font-semibold">Users</span></NavItem>
                            <NavItem to="/create-post"><PlusIcon className="w-6 h-6" /></NavItem>
                             <NotificationBell />
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                    {isAuthenticated && user ? (
                        <div className="group relative">
                            <Link to={`/profile/${user.id}`}>
                                <img
                                    src={getAvatarUrl(user)}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-primary cursor-pointer"
                                />
                            </Link>
                            <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                                <div className="px-4 py-2 text-sm text-text-primary border-b border-border">
                                    Signed in as <br />
                                    <strong className="font-medium">{user.name}</strong>
                                </div>
                                <Link to={`/profile/${user.id}`} className="block px-4 py-2 text-sm text-text-secondary hover:bg-border hover:text-text-primary">
                                    Your Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full text-left block px-4 py-2 text-sm text-danger hover:opacity-80 transition-opacity"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-hover">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};