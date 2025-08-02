
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  FilmIcon,
  PlusCircleIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '@/App';
import { useNotifications } from '@/hooks/useNotifications';

const BottomNavBar: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/shorts', icon: FilmIcon, label: 'Shorts' },
    { href: '/upload', icon: PlusCircleIcon, label: 'Upload' },
    { href: '/notifications', icon: BellIcon, label: 'Notifications', notificationCount: unreadCount },
    { href: `/profile/${user.id}`, icon: UserCircleIcon, label: 'Profile' },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
      isActive ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-accent'
    }`;
    
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-[0_-2px_5px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink to={item.href} key={item.label} className={navLinkClasses} end={item.href === '/'}>
             <div className="relative">
                <item.icon className={`h-7 w-7 ${item.label === 'Upload' ? 'text-accent text-4xl h-10 w-10' : ''}`} />
                 {item.notificationCount && item.notificationCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {item.notificationCount > 9 ? '9+' : item.notificationCount}
                    </span>
                 )}
            </div>
            <span className={`text-xs ${item.label === 'Upload' ? 'hidden' : ''}`}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
