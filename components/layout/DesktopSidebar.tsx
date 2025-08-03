
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/App';
import useNavMenu from '@/components/ui/hooks/useNavMenu';

interface DesktopSidebarProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isOpen, setOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menuItems = useNavMenu();
    
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${
            isActive
                ? 'bg-accent text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-accent/20 hover:text-accent dark:hover:text-white'
        }`;
        
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.username || 'default'}`;

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-dark-card shadow-lg flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 h-16">
                <Link to="/" className={`font-display text-2xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-opacity duration-200 ${!isOpen && 'opacity-0 invisible'}`}>
                    NAXXIVO
                </Link>
                <button onClick={() => setOpen(!isOpen)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-bg">
                    {isOpen ? <ChevronDoubleLeftIcon className="h-6 w-6"/> : <ChevronDoubleRightIcon className="h-6 w-6"/>}
                </button>
            </div>

            {user && (
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                     <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                        <img src={user.photo_url || defaultAvatar} alt="profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                        <div className={`transition-opacity duration-200 ${!isOpen && 'opacity-0 invisible'}`}>
                           <span className="font-bold block truncate">{user.name || user.username}</span>
                           <span className="text-sm text-gray-500 block truncate">@{user.username}</span>
                        </div>
                    </Link>
                </div>
            )}
            
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                     <NavLink to={item.href} key={item.label} className={navLinkClasses} end={item.href === '/'}>
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'opacity-0 invisible'}`}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            
            <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                 <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg w-full">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'opacity-0 invisible'}`}>Logout</span>
                 </button>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
