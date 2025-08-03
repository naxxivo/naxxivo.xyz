
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useNavMenu from '@/components/ui/hooks/useNavMenu';

interface SidebarMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menuItems = useNavMenu();

    if (!user) {
        return null;
    }
    
    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        navigate('/');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
        `flex items-center w-full p-4 text-lg font-semibold transition-all duration-200 
        ${isActive 
            ? 'bg-accent text-white' 
            : 'text-secondary-purple dark:text-dark-text hover:bg-accent/10'}`
        ;
        
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.username || 'default'}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 z-50"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-secondary-white dark:bg-dark-bg z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                             <div className="font-display text-2xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent">
                                NAXXIVO
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2">
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                        </div>
                        
                        <nav className="flex-1 overflow-y-auto">
                           {user && (
                                <div className="p-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
                                    <img src={user.photo_url || defaultAvatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold">{user.name || user.username}</p>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                           )}
                            <ul className="py-2">
                                {menuItems.map(item => (
                                    <li key={item.label}>
                                        <NavLink to={item.href} className={navLinkClasses} onClick={() => setIsOpen(false)} end={item.href === '/'}>
                                            <item.icon className="h-6 w-6 mr-4" />
                                            {item.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={handleLogout} className="flex items-center w-full p-4 text-lg font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SidebarMenu;
