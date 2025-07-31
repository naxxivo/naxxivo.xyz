

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';
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
import AdminRoute from './components/auth/AdminRoute';
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
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminMarketplacePage from './pages/admin/AdminMarketplacePage';

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

  const constructAppUser = (baseUser: User, profileData: Partial<Profile>, fallbackUsername: string): AppUser => {
    return {
        // Fields from Supabase User
        id: baseUser.id,
        app_metadata: baseUser.app_metadata,
        user_metadata: baseUser.user_metadata,
        aud: baseUser.aud,
        confirmation_sent_at: baseUser.confirmation_sent_at,
        recovery_sent_at: baseUser.recovery_sent_at,
        email_change_sent_at: baseUser.email_change_sent_at,
        new_email: baseUser.new_email,
        new_phone: baseUser.new_phone,
        invited_at: baseUser.invited_at,
        action_link: baseUser.action_link,
        email: baseUser.email,
        phone: baseUser.phone,
        created_at: baseUser.created_at,
        confirmed_at: baseUser.confirmed_at,
        email_confirmed_at: baseUser.email_confirmed_at,
        phone_confirmed_at: baseUser.phone_confirmed_at,
        last_sign_in_at: baseUser.last_sign_in_at,
        updated_at: baseUser.updated_at,
        identities: baseUser.identities,

        // Fields from our Profile table
        role: profileData.role || 'user',
        username: profileData.username || fallbackUsername,
        name: profileData.name || null,
        bio: profileData.bio || null,
        photo_url: profileData.photo_url || null,
        cover_url: profileData.cover_url || null,
        address: profileData.address || null,
        website_url: profileData.website_url || null,
        youtube_url: profileData.youtube_url || null,
        facebook_url: profileData.facebook_url || null,
    };
  };

  const fetchUserProfile = async (authUser: User): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, bio, photo_url, cover_url, website_url, youtube_url, facebook_url, address, role, created_at')
      .eq('id', authUser.id)
      .maybeSingle(); 

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    const profile = data as unknown as (Profile | null);
    const username = authUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `user${Date.now()}`;

    if (profile) { // Profile exists
      return constructAppUser(authUser, profile, username);
    } else { // Profile does not exist, create a fallback
      return constructAppUser(authUser, {}, username);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
          console.error("Error getting session on initial load:", error);
      } else {
          setSession(session);
          if (session?.user) {
              const userProfile = await fetchUserProfile(session.user);
              setUser(userProfile);
          } else {
              setUser(null);
          }
      }
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
              setSession(newSession);
              if (newSession?.user) {
                  const userProfile = await fetchUserProfile(newSession.user);
                  setUser(userProfile);
              } else {
                  setUser(null);
              }
          }
      );

      return () => {
          authListener.subscription.unsubscribe();
      };
    };

    const unsubscribePromise = initializeSession();

    return () => {
      unsubscribePromise.then(cleanup => cleanup && cleanup());
    };
}, []);


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      alert('Could not log out. Please try again.');
    }
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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="market" element={<AdminMarketplacePage />} />
          </Route>

          {/* User-facing Routes */}
          <Route path="/*" element={
            <Layout>
              <Routes>
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
            </Layout>
          } />
        </Routes>
      </AnimatePresence>
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