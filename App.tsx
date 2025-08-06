import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthPage from './components/auth/AuthPage';
import AuthForm from './components/auth/AuthForm';
import UserApp from './components/UserApp';
import AdminPanel from './components/admin/AdminPanel';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'onboarding' | 'login' | 'signup';
type UserRole = 'user' | 'admin';

const DYNAMIC_STYLE_ID = 'dynamic-theme-styles';

const applyThemeFromStorage = () => {
    const customThemeJSON = localStorage.getItem('custom-theme');
    const root = document.documentElement;

    if (customThemeJSON) {
        try {
            const customTheme = JSON.parse(customThemeJSON);
            const styleElement = document.getElementById(DYNAMIC_STYLE_ID) || document.createElement('style');
            styleElement.id = DYNAMIC_STYLE_ID;

            const lightVars = Object.entries(customTheme.light).map(([k, v]) => `--theme-${k}: ${v};`).join('\n');
            const darkVars = Object.entries(customTheme.dark).map(([k, v]) => `--theme-${k}: ${v};`).join('\n');
            
            styleElement.innerHTML = `
                :root {
                    ${lightVars}
                }
                :root.dark {
                     ${darkVars}
                }
            `;
            document.head.appendChild(styleElement);
        } catch(e) {
            console.error("Failed to parse or apply custom theme.", e);
            localStorage.removeItem('custom-theme');
        }
    } else {
        const styleElement = document.getElementById(DYNAMIC_STYLE_ID);
        if (styleElement) {
            styleElement.innerHTML = '';
        }
    }
};

const getThemeFromDatabase = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_themes')
        .select('light_theme, dark_theme')
        .eq('user_id', userId)
        .single();

    if (data) {
        const theme = { light: data.light_theme, dark: data.dark_theme };
        localStorage.setItem('custom-theme', JSON.stringify(theme));
    } else if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Error fetching theme:", error);
    }
    // Always apply from storage after fetch, to handle both found and not-found cases
    applyThemeFromStorage();
};


const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState<AuthMode>('onboarding');
    const [isAdminView, setIsAdminView] = useState(false);

    useEffect(() => {
        // Apply system preference for light/dark mode
        const applySystemTheme = () => {
            const theme = localStorage.getItem('theme') || 'system';
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applySystemTheme();
        
        // This event listener handles live updates from the Theme Customizer
        window.addEventListener('theme-updated', applyThemeFromStorage);

        // This handles changes from the Light/Dark/System toggle in settings
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applySystemTheme);
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme') {
                applySystemTheme();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Main auth logic
        const getSessionAndProfile = async (currentSession: Session | null) => {
            if (currentSession) {
                 // Fetch user role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentSession.user.id)
                    .single();
                setUserRole((profile?.role as UserRole) || 'user');

                // Fetch and apply user's saved theme
                await getThemeFromDatabase(currentSession.user.id);
            } else {
                setUserRole('user');
                // On logout, clear custom theme
                localStorage.removeItem('custom-theme');
                applyThemeFromStorage(); // This will effectively remove the dynamic styles
            }
            setSession(currentSession);
            setLoading(false);
            setIsAdminView(false);
        };

        // Check for initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            getSessionAndProfile(session);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(true);
            getSessionAndProfile(session);
        });

        return () => {
            subscription.unsubscribe();
            mediaQuery.removeEventListener('change', applySystemTheme);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-updated', applyThemeFromStorage);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[var(--theme-bg)]">
                <LoadingSpinner />
                <span className="text-[var(--theme-text)]">Loading Session...</span>
            </div>
        );
    }

    if (!session) {
        return (
            <AnimatePresence mode="wait">
                {authMode === 'onboarding' && (
                    <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AuthPage onSetMode={setAuthMode} />
                    </motion.div>
                )}
                {(authMode === 'login' || authMode === 'signup') && (
                     <motion.div key="authform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AuthForm mode={authMode} onSetMode={setAuthMode} />
                     </motion.div>
                )}
            </AnimatePresence>
        );
    }

    if (isAdminView && userRole === 'admin') {
        return <AdminPanel session={session} onExitAdminView={() => setIsAdminView(false)} />;
    }

    return <UserApp session={session} onEnterAdminView={userRole === 'admin' ? () => setIsAdminView(true) : undefined} />;
};

export default App;