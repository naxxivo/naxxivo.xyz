

import React from 'react';
import Header from './Header';
import { usePetals } from '../../hooks/usePetals';
import FloatingMenu from './FloatingMenu';
import { useTheme } from '../theme/ThemeProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, petalsEnabled } = useTheme();
  usePetals(theme === 'light' && petalsEnabled);

  return (
    <div className="min-h-screen bg-secondary-white dark:bg-dark-bg text-secondary-purple dark:text-dark-text transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24 pb-28">
        {children}
      </main>
      <FloatingMenu />
    </div>
  );
};

export default Layout;
