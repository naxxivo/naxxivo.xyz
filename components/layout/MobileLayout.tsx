
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/App';

import FloatingActionMenu from '@/components/navigation/FloatingActionMenu';
import SidebarMenu from '@/components/navigation/SidebarMenu';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import CircularMenu from '@/components/navigation/CircularMenu';
import MegaMenu from '@/components/navigation/MegaMenu'; // On mobile, this will fallback to sidebar
import ThreeDotMenu from '@/components/navigation/ThreeDotMenu';
import TVMenu from '@/components/navigation/TVMenu';
import useMediaQuery from '../ui/hooks/useMediaQuery';


interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { menuStyle } = useTheme();
  const { user } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const renderNavigation = () => {
    if (!user) return null;

    switch (menuStyle) {
      case 'floating-action':
        return <FloatingActionMenu />;
      case 'sidebar':
        return <SidebarMenu isOpen={isMenuOpen} setIsOpen={setMenuOpen} />;
      case 'bottom-tab':
        return <BottomNavBar />;
      case 'circular':
        return <CircularMenu />;
      case 'mega-menu':
        // On mobile, the Mega Menu behaves like a Sidebar Menu for better UX.
        return <SidebarMenu isOpen={isMenuOpen} setIsOpen={setMenuOpen} />;
      case 'three-dot':
         return <ThreeDotMenu isOpen={isMenuOpen} setIsOpen={setMenuOpen} />;
      case 'tv-optimized':
          // TV menu is less ideal for mobile, but if selected, it will open.
         return <TVMenu isOpen={isMenuOpen} setIsOpen={setMenuOpen} />;
      default:
        return <FloatingActionMenu />;
    }
  };
  
  const showHeaderMenuButton = menuStyle === 'sidebar' || menuStyle === 'mega-menu' || menuStyle === 'three-dot' || menuStyle === 'tv-optimized';

  return (
    <div className="min-h-screen bg-secondary-white dark:bg-dark-bg text-secondary-purple dark:text-dark-text transition-colors duration-300">
      <Header onMenuButtonClick={showHeaderMenuButton ? () => setMenuOpen(true) : undefined} />
      
      <main>
        <div className="h-16" /> {/* Spacer for fixed header */}
        <div className="container mx-auto px-4 py-8">
            {children}
        </div>
      </main>

      {renderNavigation()}
    </div>
  );
};

export default MobileLayout;
