
import React from 'react';
import { usePetals } from '@/components/ui/hooks/usePetals.ts';
import { useTheme } from '@/components/theme/ThemeProvider.tsx';
import useMediaQuery from '@/components/ui/hooks/useMediaQuery.ts';
import DesktopLayout from './DesktopLayout.tsx';
import MobileLayout from './MobileLayout.tsx';

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