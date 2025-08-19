
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { UserIcon } from './icons/UserIcon';
import { SearchIcon } from './icons/SearchIcon';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { cartCount } = useCart();
  const { isAuthenticated, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-background/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold font-display text-gray-900 dark:text-text-primary">
              Nordic.
            </Link>
          </div>
          
          {/* Centered Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-accent rounded-full bg-gray-100 dark:bg-accent placeholder-gray-500 dark:placeholder-text-muted text-gray-900 dark:text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
              <button type="submit" className="absolute inset-y-0 left-0 pl-4 flex items-center" aria-label="Submit search">
                <SearchIcon className="h-5 w-5 text-gray-500 dark:text-text-muted" />
              </button>
            </form>
          </div>

          {/* Icons & Nav */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex space-x-6 text-sm font-medium text-gray-800 dark:text-text-primary">
                <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
                {isAdmin && <Link to="/admin" className="font-semibold text-primary hover:underline">Admin Panel</Link>}
            </nav>
            <div className='hidden lg:block w-px h-6 bg-gray-200 dark:bg-accent'></div>
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/profile" className="text-gray-500 dark:text-text-muted hover:text-primary transition-colors" aria-label="My Account">
                <UserIcon className="h-6 w-6" />
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-800 dark:text-text-primary hover:text-primary transition-colors">
                Login
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-500 dark:text-text-muted hover:text-primary transition-colors" aria-label="Shopping Cart">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex items-center justify-center w-5 h-5 bg-primary text-background dark:text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;