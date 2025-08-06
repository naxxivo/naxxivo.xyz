import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { BackArrowIcon, SunIcon, MoonIcon } from '../common/AppIcons';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

interface ThemeCustomizerPageProps {
    onBack: () => void;
}

// --- Default Theme Configuration --- //
const defaultTheme = {
  light: {
    'bg': '#DAF1DE',
    'text': '#333333',
    'text-secondary': '#235347',
    'primary': '#0E2B26',
    'primary-hover': '#0A1F1B',
    'primary-text': '#FFFFFF',
    'secondary': '#8EB69B',
    'secondary-hover': '#DAF1DE',
    'secondary-text': '#0E2B26',
    'card-bg': '#FFFFFF',
    'card-bg-alt': 'rgba(218, 241, 222, 0.5)',
    'header-bg': '#8EB69B',
    'header-text': '#FFFFFF',
    'ring': '#0E2B26',
  },
  dark: {
    'bg': '#0A1916',
    'text': '#E0F0E9',
    'text-secondary': '#8EB69B',
    'primary': '#16A832',
    'primary-hover': '#128a28',
    'primary-text': '#FFFFFF',
    'secondary': '#8EB69B',
    'secondary-hover': 'rgba(142, 182, 155, 0.1)',
    'secondary-text': '#8EB69B',
    'card-bg': '#102A27',
    'card-bg-alt': '#0A1916',
    'header-bg': '#102A27',
    'header-text': '#E0F0E9',
    'ring': '#16A832',
  }
};

type ThemeConfig = typeof defaultTheme;
type ThemeMode = 'light' | 'dark';
type ColorKey = keyof ThemeConfig['light'];

// --- Helper Components --- //

const ColorInput = ({ label, color, onChange }: { label: string, color: string, onChange: (newColor: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-[var(--theme-card-bg-alt)] rounded-lg">
        <label className="text-sm font-medium text-[var(--theme-text-secondary)] capitalize">{label.replace(/-/g, ' ')}</label>
        <div className="flex items-center gap-2 border border-[var(--theme-secondary)]/30 rounded-md p-1">
            <input
                type="color"
                value={color}
                onChange={e => onChange(e.target.value)}
                className="w-7 h-7 bg-transparent border-none cursor-pointer"
                aria-label={`Pick color for ${label}`}
            />
            <input
                type="text"
                value={color}
                onChange={e => onChange(e.target.value)}
                className="w-24 bg-transparent text-sm text-center text-[var(--theme-text)] focus:outline-none"
                aria-label={`Hex code for ${label}`}
            />
        </div>
    </div>
);

const LivePreview = () => (
    <div className="p-4 bg-[var(--theme-bg)] border-2 border-dashed border-[var(--theme-secondary)] rounded-xl space-y-4">
        <h3 className="text-xl font-bold text-center text-[var(--theme-text)]">Live Preview</h3>
        <div className="p-4 bg-[var(--theme-card-bg)] rounded-lg shadow-sm">
            <p className="text-lg font-bold text-[var(--theme-text)]">Example Card</p>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">This is how components will look with your new theme.</p>
        </div>
        <div className="space-y-2">
            <Button variant="primary" size="small">Primary Button</Button>
            <Button variant="secondary" size="small">Secondary Button</Button>
        </div>
    </div>
);


// --- Main Component --- //

const ThemeCustomizerPage: React.FC<ThemeCustomizerPageProps> = ({ onBack }) => {
    const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
    const [activeMode, setActiveMode] = useState<ThemeMode>('light');
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load initial theme from localStorage (which is primed on app load)
    useEffect(() => {
        const savedTheme = localStorage.getItem('custom-theme');
        try {
            if (savedTheme) {
                setTheme(JSON.parse(savedTheme));
            }
        } catch(e) {
            console.error("Failed to parse custom theme from localStorage", e);
        }
    }, []);
    
    // Apply theme changes to the DOM live
    const applyThemeLive = useCallback((themeToApply: ThemeConfig) => {
        const event = new CustomEvent('theme-updated');
        localStorage.setItem('custom-theme', JSON.stringify(themeToApply));
        window.dispatchEvent(event);
    }, []);
    
    useEffect(() => {
        applyThemeLive(theme);
    }, [theme, applyThemeLive]);

    const handleColorChange = (key: ColorKey, newColor: string) => {
        setTheme(prevTheme => ({
            ...prevTheme,
            [activeMode]: {
                ...prevTheme[activeMode],
                [key]: newColor
            }
        }));
    };
    
    const saveTheme = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to save a theme.");

            const { error } = await supabase
                .from('user_themes')
                .upsert({
                    user_id: user.id,
                    light_theme: theme.light,
                    dark_theme: theme.dark,
                    updated_at: new Date().toISOString()
                } as any);
            
            if (error) throw error;
            
            // LocalStorage and live update is already handled by the useEffect hook
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

        } catch (err: any) {
            alert(`Failed to save theme: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const resetTheme = async () => {
        setIsResetting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User must be logged in to reset their theme.");

            // Delete from database
            const { error } = await supabase.from('user_themes').delete().eq('user_id', user.id);
            if (error) throw error;
            
            // Revert state to default and apply live
            localStorage.removeItem('custom-theme');
            setTheme(defaultTheme);

        } catch(err: any) {
            alert(`Failed to reset theme: ${err.message}`);
        } finally {
            setIsResetting(false);
        }
    };

    const colorsForCurrentMode = Object.entries(theme[activeMode]) as [ColorKey, string][];

    return (
        <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">Theme Customizer</h1>
                <div className="w-6"></div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-6">
                <LivePreview />

                <div>
                    <div className="flex justify-center mb-4">
                        <div className="flex bg-[var(--theme-card-bg-alt)] p-1 rounded-full">
                           {(['light', 'dark'] as ThemeMode[]).map(mode => (
                               <button 
                                 key={mode}
                                 onClick={() => setActiveMode(mode)}
                                 className="relative flex-1 py-1.5 px-4 flex items-center justify-center text-sm font-medium focus:outline-none transition-colors"
                               >
                                    {activeMode === mode && (
                                        <motion.div
                                            layoutId="theme-mode-active"
                                            className="absolute inset-0 bg-[var(--theme-card-bg)] rounded-full shadow-md"
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <span className={`relative z-10 flex items-center gap-2 ${activeMode === mode ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-secondary)]'}`}>
                                       {mode === 'light' ? <SunIcon/> : <MoonIcon/>}
                                       {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                                    </span>
                               </button>
                           ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {colorsForCurrentMode.map(([key, color]) => (
                            <ColorInput
                                key={`${activeMode}-${key}`}
                                label={key}
                                color={color}
                                onChange={(newColor) => handleColorChange(key, newColor)}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <footer className="flex-shrink-0 p-4 bg-[var(--theme-card-bg)]/80 backdrop-blur-sm border-t border-[var(--theme-secondary)]/20 space-y-3">
                <Button onClick={saveTheme} disabled={isSaving || showSuccess}>
                    {isSaving ? <LoadingSpinner /> : (showSuccess ? 'Theme Saved!' : 'Save Theme')}
                </Button>
                <Button onClick={resetTheme} variant="secondary" disabled={isResetting}>
                    {isResetting ? <LoadingSpinner /> : 'Reset to Default'}
                </Button>
            </footer>
        </div>
    );
};

export default ThemeCustomizerPage;