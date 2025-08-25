import React, { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from './types';
import Auth from './components/Auth';
import Home from './components/Home';
import LoadingScreen from './components/LoadingScreen';
import ProfilePage from './components/profile/ProfilePage';
import AdminDashboard from './components/admin/AdminDashboard';

export type View = 'home' | 'profile' | 'admin';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('home');

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      // Show loading screen briefly on auth change for smooth transition
      if (_event !== 'INITIAL_SESSION') {
          setLoading(true);
          setTimeout(() => setLoading(false), 500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
  };

  const navigate = (newView: View) => {
    setView(newView);
  };
  
  const renderContent = () => {
      if (loading) {
          return <LoadingScreen />;
      }
      if (!session) {
          return <Auth />;
      }
      switch(view) {
          case 'admin':
              return profile?.is_admin
                ? <AdminDashboard onNavigateHome={() => navigate('home')} />
                : <Home user={session.user} profile={profile} onLogout={handleLogout} onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} />;
          case 'profile':
              return <ProfilePage user={session.user} onNavigateHome={() => navigate('home')} />;
          case 'home':
          default:
              return <Home user={session.user} profile={profile} onLogout={handleLogout} onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} />;
      }
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      {renderContent()}
    </div>
  );
};

export default App;