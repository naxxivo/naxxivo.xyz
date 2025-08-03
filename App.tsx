


import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/locales/en/pages/services/supabase.ts';
import Layout from '@/components/layout/Layout.tsx';
import HomePage from '@/locales/en/pages/HomePage.tsx';
import AuthPage from '@/locales/en/pages/AuthPage.tsx';
import { ProfilePage } from '@/locales/en/pages/ProfilePage.tsx';
import UploadPage from '@/locales/en/pages/UploadPage.tsx';
import MessagesPage from '@/locales/en/pages/MessagesPage.tsx';
import UsersPage from '@/locales/en/pages/UsersPage.tsx';
import SettingsPage from '@/locales/en/pages/SettingsPage.tsx';
import NotFoundPage from '@/locales/en/pages/NotFoundPage.tsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute.tsx';
import AdminRoute from '@/components/auth/AdminRoute.tsx';
import { AppUser, Profile } from '@/types.ts';
import { AnimeLoader } from '@/components/ui/Loader.tsx';
import FollowsPage from '@/locales/en/pages/FollowsPage.tsx';
import AnimeListPage from '@/locales/en/pages/AnimeListPage.tsx';
import SeriesDetailPage from '@/locales/en/pages/SeriesDetailPage.tsx';
import WatchEpisodePage from '@/locales/en/pages/WatchEpisodePage.tsx';
import CreateSeriesPage from '@/locales/en/pages/CreateSeriesPage.tsx';
import AddEpisodePage from '@/locales/en/pages/AddEpisodePage.tsx';
import ShortsPage from '@/locales/en/pages/ShortsPage.tsx';
import AdminLayout from '@/components/layout/AdminLayout.tsx';
import AdminDashboardPage from '@/locales/en/pages/admin/AdminDashboardPage.tsx';
import AdminUsersPage from '@/locales/en/pages/admin/AdminUsersPage.tsx';
import AdminPostsPage from '@/locales/en/pages/admin/AdminPostsPage.tsx';
import HealthHubPage from '@/locales/en/pages/HealthHubPage.tsx';
import AilmentDetailPage from '@/locales/en/pages/AilmentDetailPage.tsx';
import SinglePostPage from '@/locales/en/pages/SinglePostPage.tsx';
import NotificationsPage from '@/locales/en/pages/NotificationsPage.tsx';
import ComponentShowcasePage from '@/locales/en/pages/ComponentShowcasePage.tsx';
import SiteBuilderPage from '@/locales/en/pages/SiteBuilderPage.tsx';
import PublicSitePage from '@/locales/en/pages/PublicSitePage.tsx';
import AIChatPage from '@/locales/en/pages/AIChatPage.tsx';


interface AuthContextType {
  session: any | null;
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const constructAppUser = (baseUser: any, profileData: Partial<Profile>, fallbackUsername: string): AppUser => {
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

  const fetchUserProfile = async (authUser: any): Promise<AppUser | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, bio, photo_url, cover_url, website_url, youtube_url, facebook_url, address, role, created_at')
      .eq('id', authUser.id)
      .maybeSingle(); 

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    const profile = data as (Profile | null);
    const username = authUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `user${Date.now()}`;

    if (profile) { // Profile exists
      return constructAppUser(authUser, profile, username);
    } else { // Profile does not exist, create a fallback
      return constructAppUser(authUser, {}, username);
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
        subscription.unsubscribe();
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
        <AnimeLoader text="Loading... 頑張って!" />
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
          </Route>
          
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/site/:username" element={<PublicSitePage />} />

          {/* User-facing Routes with classic Layout */}
          <Route path="/" element={<Layout><Outlet /></Layout>}>
              <Route index element={<HomePage />} />
               <Route path="post/:postId" element={<SinglePostPage />} />
              <Route path="profile/:userId" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="messages/:otherUserId" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="upload" element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="showcase" element={
                <ProtectedRoute>
                  <ComponentShowcasePage />
                </ProtectedRoute>
              } />
               <Route path="notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="profile/:userId/follows" element={
                <ProtectedRoute>
                  <FollowsPage />
                </ProtectedRoute>
              } />
              
              {/* Shorts Route */}
              <Route path="shorts" element={<ShortsPage />} />

              {/* Anime Routes */}
              <Route path="anime" element={<AnimeListPage />} />
              <Route path="anime/new" element={
                <ProtectedRoute>
                  <CreateSeriesPage />
                </ProtectedRoute>
              } />
              <Route path="anime/:seriesId" element={<SeriesDetailPage />} />
              <Route path="anime/:seriesId/add-episode" element={
                <ProtectedRoute>
                  <AddEpisodePage />
                </ProtectedRoute>
              } />
              <Route path="anime/:seriesId/episode/:episodeNumber" element={<WatchEpisodePage />} />
              
              {/* Health Hub Routes */}
              <Route path="health" element={<HealthHubPage />} />
              <Route path="health/:ailmentId" element={<AilmentDetailPage />} />
              
              {/* AI Chat Route */}
              <Route path="ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />

              {/* Site Builder Route */}
              <Route path="build-site" element={<ProtectedRoute><SiteBuilderPage /></ProtectedRoute>} />
          </Route>
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