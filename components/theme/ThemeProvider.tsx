
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MenuButtonStyle } from '../ui/menu-buttons';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  petalsEnabled: boolean;
  setPetalsEnabled: (enabled: boolean) => void;
  menuButtonStyle: MenuButtonStyle;
  setMenuButtonStyle: (style: MenuButtonStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('accentColor') || '#FF6584'; // Default to primary-pink
  });
  
  const [petalsEnabled, setPetalsEnabled] = useState<boolean>(() => {
    const savedPetals = localStorage.getItem('petalsEnabled');
    return savedPetals ? JSON.parse(savedPetals) : true;
  });

  const [menuButtonStyle, setMenuButtonStyleState] = useState<MenuButtonStyle>(() => {
    const savedStyle = localStorage.getItem('menuButtonStyle') as MenuButtonStyle;
    return savedStyle || 'default';
  });


  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle dark/light mode
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Handle accent color
    root.style.setProperty('--color-accent', accentColor);
    localStorage.setItem('accentColor', accentColor);
    
    // Handle petals setting
    localStorage.setItem('petalsEnabled', JSON.stringify(petalsEnabled));

    // Handle menu button style setting
    localStorage.setItem('menuButtonStyle', menuButtonStyle);

  }, [theme, accentColor, petalsEnabled, menuButtonStyle]);

  const value = useMemo(() => ({
    theme,
    setTheme: setThemeState,
    accentColor,
    setAccentColor: setAccentColorState,
    petalsEnabled,
    setPetalsEnabled,
    menuButtonStyle,
    setMenuButtonStyle: setMenuButtonStyleState,
  }), [theme, accentColor, petalsEnabled, menuButtonStyle]);


  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
