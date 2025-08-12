import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/auth-js';
import { supabase } from './integrations/supabase/client';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthPage from './components/auth/AuthPage';
import AuthForm from './components/auth/AuthForm';
import UserApp from './components/UserApp';
import AdminPanel from './components/admin/AdminPanel';
import WelcomeBonusModal from './components/auth/WelcomeBonusModal';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, TablesUpdate } from './integrations/supabase/types';
import ConnectivityStatusOverlay from './components/common/ConnectivityStatusOverlay';

type AuthMode = 'onboarding' | 'login' | 'signup';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState<AuthMode>('onboarding');
    const [isAdminView, setIsAdminView] = useState(false);
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isServerDown, setIsServerDown] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        // Initial session fetch
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null }}) => {
            setSession(session);
            setIsUserLoggedIn(!!session);
            setLoading(false); // Initial loading is done after first session check
        });

        // Setup auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            // Only change logged in status on explicit sign in or sign out events
            if (event === 'SIGNED_OUT') {
                setIsUserLoggedIn(false);
                setAuthMode('onboarding'); // Reset auth flow
            } else if (event === 'SIGNED_IN') {
                setIsUserLoggedIn(true);
            }
        });

        // Cleanup function
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Effect for connectivity
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => {
            setIsOffline(true);
            setIsServerDown(false); // Can't be a server issue if we're offline
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Effect for server health check
    useEffect(() => {
        if (isOffline) {
            return;
        }

        let isMounted = true;

        const healthCheck = async () => {
            try {
                // A very lightweight query to check server responsiveness.
                const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1);
                if (!isMounted) return;
                // "Failed to fetch" is a common browser message for network errors (CORS, DNS, server down).
                if (error && error.message.includes('Failed to fetch')) {
                    setIsServerDown(true);
                } else {
                    // If it succeeds or has a different error (like RLS), the server is responsive.
                    setIsServerDown(false);
                }
            } catch (e) {
                if(isMounted) {
                    setIsServerDown(true);
                }
            }
        };

        healthCheck(); // Initial check
        const intervalId = setInterval(healthCheck, 30000); // Check every 30 seconds

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [isOffline]);

    // Effect to react to session changes (login/logout) and profile updates
    useEffect(() => {
        if (session) {
            const getProfileAndSetupListener = async () => {
                // Fetch initial profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('has_seen_welcome_bonus')
                    .eq('id', session.user.id)
                    .single();

                if (profile && !profile.has_seen_welcome_bonus) {
                    setShowWelcomeBonus(true);
                    const updatePayload: TablesUpdate<'profiles'> = { has_seen_welcome_bonus: true };
                    await supabase.from('profiles').update(updatePayload).eq('id', session.user.id);
                }
            };
            getProfileAndSetupListener();

        } else {
            // Handle user logout
            setIsAdminView(false);
        }
    }, [session]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--theme-bg)]">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <>
            <ConnectivityStatusOverlay isOffline={isOffline} isServerDown={!isOffline && isServerDown} />
            
            {!isUserLoggedIn ? (
                 <div className="w-full min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
                    {authMode === 'onboarding' && <AuthPage onSetMode={setAuthMode} />}
                    {(authMode === 'login' || authMode === 'signup') && <AuthForm mode={authMode} onSetMode={setAuthMode} />}
                </div>
            ) : (session && (
                <>
                    <AnimatePresence>
                        {isAdminView ? (
                            <motion.div key="admin-view" {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any}>
                                <AdminPanel session={session} onExitAdminView={() => setIsAdminView(false)} />
                            </motion.div>
                        ) : (
                            <motion.div key="user-app" {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any}>
                                <UserApp session={session} onEnterAdminView={() => setIsAdminView(true)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <WelcomeBonusModal
                        isOpen={showWelcomeBonus}
                        onClose={() => setShowWelcomeBonus(false)}
                    />
                </>
            ))}
        </>
    );
};

export default App;