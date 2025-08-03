
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/App';
import { supabase } from '@/locales/en/pages/services/supabase';
import { AnimeLoader } from '@/components/ui/Loader';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (authLoading) return;
            if (!user) {
                setLoading(false);
                setIsAdmin(false);
                return;
            }
            
            try {
                const { data, error } = await supabase.rpc('is_admin');
                if (error) throw error;
                setIsAdmin(!!data);
            } catch (err) {
                console.error("Error checking admin status:", err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-secondary-white dark:bg-dark-bg">
                <AnimeLoader />
            </div>
        );
    }

    if (!user || !isAdmin) {
        // Redirect them to the /auth page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
