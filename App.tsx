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

type AuthMode = 'onboarding' | 'login' | 'signup';
type UserRole = 'user' | 'admin';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState<AuthMode>('onboarding');
    const [isAdminView, setIsAdminView] = useState(false);
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);

    useEffect(() => {
        // Ensure light mode is always active by removing the dark class if it exists.
        document.documentElement.classList.remove('dark');
        
        // Setup auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
            setSession(session);
        });

        // Initial session fetch
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null }}) => {
            setSession(session);
            setLoading(false); // Initial loading is done after first session check
        });

        // Cleanup function
        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
    
    if (!session) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={authMode}
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            transition: { duration: 0.3 },
                        } as any}
                        className="w-full h-full"
                    >
                        {authMode === 'onboarding' && <AuthPage onSetMode={setAuthMode} />}
                        {(authMode === 'login' || authMode === 'signup') && <AuthForm mode={authMode} onSetMode={setAuthMode} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }
    
    return (
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
    );
};

export default App;