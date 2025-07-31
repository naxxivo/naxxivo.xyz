
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
import FollowsPage from './pages/FollowsPage';
import AnimeListPage from './pages/AnimeListPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import WatchEpisodePage from './pages/WatchEpisodePage';
import CreateSeriesPage from './pages/CreateSeriesPage';
import AddEpisodePage from './pages/AddEpisodePage';
import MarketplacePage from './pages/MarketplacePage';
import CreateProductPage from './pages/CreateProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShortsPage from './pages/ShortsPage';

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
      .maybeSingle(); 

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) { // Profile exists
      return {
        ...authUser,
        username: data.username,
        name: data.name,
        bio: data.bio,
        photo_url: data.photo_url,
        cover_url: data.cover_url,
        address: data.address,
        website_url: data.website_url,
        youtube_url: data.youtube_url,
        facebook_url: data.facebook_url,
      };
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
            <Route path="/profile/:userId/follows" element={
              <ProtectedRoute>
                <FollowsPage />
              </ProtectedRoute>
            } />
            
            {/* Shorts Route */}
            <Route path="/shorts" element={<ShortsPage />} />

            {/* Anime Routes */}
            <Route path="/anime" element={<AnimeListPage />} />
            <Route path="/anime/new" element={
              <ProtectedRoute>
                <CreateSeriesPage />
              </ProtectedRoute>
            } />
            <Route path="/anime/:seriesId" element={<SeriesDetailPage />} />
            <Route path="/anime/:seriesId/add-episode" element={
              <ProtectedRoute>
                <AddEpisodePage />
              </ProtectedRoute>
            } />
            <Route path="/anime/:seriesId/episode/:episodeNumber" element={<WatchEpisodePage />} />

            {/* Marketplace Routes */}
            <Route path="/market" element={<MarketplacePage />} />
            <Route path="/market/new" element={
              <ProtectedRoute>
                <CreateProductPage />
              </ProtectedRoute>
            } />
            <Route path="/market/product/:productId" element={<ProductDetailPage />} />
            
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
