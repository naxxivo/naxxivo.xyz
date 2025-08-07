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

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState<AuthMode>('onboarding');
    const [isAdminView, setIsAdminView] = useState(false);

    useEffect(() => {
        const getSessionAndProfile = async (session: Session | null) => {
            if (session) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role as UserRole);
                } else if (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole('user'); 
                }
            } else {
                setUserRole('user');
            }
            setSession(session);
            setLoading(false);
            // Reset admin view on auth change
            setIsAdminView(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(true);
            getSessionAndProfile(session);
        });
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            getSessionAndProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-700 space-y-4 bg-gray-100">
                <LoadingSpinner />
                <span>Loading Session...</span>
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