

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabase';
import { Session, User } from '@supabase/supabase-js';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import MessagesPage from './pages/MessagesPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppUser, Profile } from './types';
import { AnimeLoader } from './components/ui/Loader';

interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUserProfile = async (authUser: User): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle<Profile>(); 

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) { // Profile exists
      const { id, created_at, ...profileData } = data;
      return { ...authUser, ...profileData };
    } else { // Profile does not exist, create a fallback
      const username = authUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `user${Date.now()}`;
      return {
        ...authUser,
        username,
        name: null,
        bio: null,
        photo_url: null,
        cover_url: null,
        address: null,
        website_url: null,
        youtube_url: null,
        facebook_url: null,
      };
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session);
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } else {
            setUser(null);
          }
        } catch(e) {
          console.error("Error during auth state change handling:", e);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      alert('Could not log out. Please try again.');
    }
    // The onAuthStateChange listener will automatically handle clearing the user state.
  };
  
  const refreshUser = async () => {
    if(session?.user){
      const updatedUser = await fetchUserProfile(session.user);
      setUser(updatedUser);
    }
  }

  const authContextValue: AuthContextType = {
    session,
    user,
    loading,
    logout: handleLogout,
    refreshUser,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-secondary-white dark:bg-dark-bg">
        <AnimeLoader />
      </div>
    ); 
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
             <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/messages/:otherUserId" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />
             <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default App;
