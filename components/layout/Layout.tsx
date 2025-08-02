
import React from 'react';
import Header from '@/components/layout/Header';
import { usePetals } from '@/hooks/usePetals';
import { useTheme } from '@/components/theme/ThemeProvider';
import FloatingMenu from '@/components/layout/FloatingMenu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, petalsEnabled } = useTheme();
  
  usePetals(theme === 'light' && petalsEnabled);

  return (
    <div className="min-h-screen bg-secondary-white dark:bg-dark-bg text-secondary-purple dark:text-dark-text transition-colors duration-300">
      <Header />
      <FloatingMenu />
      
      <main className="transition-all duration-300">
        {/* Spacer for the fixed header */}
        <div className="h-16" /> 
        <div className="container mx-auto px-4 py-8">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
