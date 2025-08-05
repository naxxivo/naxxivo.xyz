
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import Button from '../ui/Button';
import { UserIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../theme/ThemeProvider';

const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-md transition-colors duration-300">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-display text-2xl md:text-3xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300">
          NAXXIVO
        </Link>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-secondary-purple dark:text-primary-yellow p-2 rounded-full hover:bg-primary-yellow/20 dark:hover:bg-primary-yellow/20 transition-colors">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
          {loading ? (
            <div className="w-24 h-10 bg-gray-200 dark:bg-dark-bg rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${user.id}`} className="flex items-center space-x-2 text-primary-blue dark:text-dark-text hover:text-accent dark:hover:text-accent transition-colors">
                <UserIcon className="h-6 w-6" />
                <span className="hidden sm:inline">{user.name || user.username}</span>
              </Link>
              <button onClick={handleLogout} className="text-secondary-purple dark:text-dark-text hover:text-secondary-coral transition-colors" title="Logout">
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')} text="Login / Sign Up" />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;