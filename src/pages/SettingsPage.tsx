import React from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { useTheme } from '@/components/theme/ThemeProvider';
import { SunIcon, MoonIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Switch from '@/components/ui/Switch';
import { useAuth } from '@/App';
import { Link } from 'react-router-dom';
import NavigationStyleSelector from '@/components/ui/NavigationStyleSelector';

const colorPalettes = [
  { name: 'Sakura Pink', color: '#FF6584' },
  { name: 'Ghibli Blue', color: '#6A5ACD' },
  { name: 'Sunny Yellow', color: '#FFD166' },
  { name: 'Coral Kiss', color: '#FF8E72' },
  { name: 'Emerald Green', color: '#4ADE80' },
  { name: 'Ocean Teal', color: '#2DD4BF' },
];

const SettingsPage: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor, petalsEnabled, setPetalsEnabled } = useTheme();
  const { user } = useAuth();

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-8 transition-all duration-300 text-center">
          Settings
        </h1>

        <div className="bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-primary-blue/20 space-y-8">
          
          <NavigationStyleSelector />

          <div>
            <h2 className="text-2xl font-bold mb-4">Display Mode</h2>
            <div className="flex items-center space-x-4 bg-gray-200 dark:bg-dark-bg p-2 rounded-full">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-full py-2 transition-all ${theme === 'light' ? 'bg-white dark:bg-dark-card shadow' : ''}`}
              >
                <SunIcon className="h-6 w-6 text-yellow-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-full py-2 transition-all ${theme === 'dark' ? 'bg-white dark:bg-dark-card shadow' : ''}`}
              >
                <MoonIcon className="h-6 w-6 text-primary-blue" />
                <span>Dark</span>
              </button>
            </div>
            <p className="text-sm mt-2 text-secondary-purple/80 dark:text-dark-text/70">
              Choose between a light and dark theme for your viewing comfort.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Accent Color</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {colorPalettes.map((palette) => (
                <div key={palette.color} className="flex flex-col items-center">
                  <button
                    onClick={() => setAccentColor(palette.color)}
                    className={`w-16 h-16 rounded-full transition-transform hover:scale-110 shadow-md ${accentColor === palette.color ? 'ring-4 ring-offset-2 dark:ring-offset-dark-card ring-black dark:ring-white' : ''}`}
                    style={{ backgroundColor: palette.color }}
                    aria-label={`Set accent color to ${palette.name}`}
                  />
                  <span className="text-xs mt-2">{palette.name}</span>
                </div>
              ))}
            </div>
             <p className="text-sm mt-2 text-secondary-purple/80 dark:text-dark-text/70">
              Personalize the look of buttons and highlights across the app.
            </p>
          </div>

           <div>
            <h2 className="text-2xl font-bold mb-4">Visual Effects</h2>
            <div className="flex items-center justify-between bg-gray-200/50 dark:bg-dark-bg/50 p-4 rounded-lg">
                <div>
                    <h3 className="font-semibold">Falling Petals Effect</h3>
                    <p className="text-sm text-secondary-purple/80 dark:text-dark-text/70">Enable or disable the falling cherry blossom petals on light mode.</p>
                </div>
                <Switch 
                    checked={petalsEnabled} 
                    onChange={setPetalsEnabled} 
                />
            </div>
          </div>

          {user?.role === 'admin' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Administration</h2>
              <Link to="/admin">
                <div className="flex items-center justify-between bg-gray-200/50 dark:bg-dark-bg/50 p-4 rounded-lg hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <ShieldCheckIcon className="h-8 w-8 text-accent" />
                    <div>
                      <h3 className="font-semibold">Access Admin Panel</h3>
                      <p className="text-sm text-secondary-purple/80 dark:text-dark-text/70">Manage users, content, and platform settings.</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;