
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, ArrowLeftOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/App';
import NotificationBell from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onMenuButtonClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuButtonClick }) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  }
  
  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.username || 'default'}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onMenuButtonClick && (
            <button onClick={onMenuButtonClick} className="p-2 text-secondary-purple dark:text-dark-text rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg lg:hidden">
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          <Link to="/" className="font-display text-3xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300">
            NAXXIVO
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-secondary-purple dark:text-primary-yellow p-2 rounded-full hover:bg-primary-yellow/20 dark:hover:bg-primary-yellow/20 transition-colors">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} className="flex items-center space-x-2">
                <img src={user.photo_url || defaultAvatar} alt="profile" className="w-9 h-9 rounded-full object-cover"/>
                <span className="font-semibold hidden lg:block">{user.name || user.username}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-secondary-purple dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-bg rounded-full" title="Logout">
                <ArrowLeftOnRectangleIcon className="h-6 w-6"/>
              </button>
            </>
          ) : (
            <Link to="/auth" className="font-semibold hover:text-accent">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
