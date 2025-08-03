
import React from 'react';
import { usePetals } from '@/components/ui/hooks/usePetals';
import { useTheme } from '@/components/theme/ThemeProvider';
import useMediaQuery from '@/components/ui/hooks/useMediaQuery';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, petalsEnabled } = useTheme();
  usePetals(theme === 'light' && petalsEnabled);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return isDesktop ? (
    <DesktopLayout>{children}</DesktopLayout>
  ) : (
    <MobileLayout>{children}</MobileLayout>
  );
};

export default Layout;
