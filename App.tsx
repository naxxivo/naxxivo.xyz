import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Home from './components/Home';
import LoadingScreen from './components/LoadingScreen';
import ProfilePage from './components/profile/ProfilePage';
import AdminDashboard from './components/admin/AdminDashboard';

export type View = 'home' | 'profile' | 'admin';

const App: React.FC = () => {
  const { session, profile, loading } = useAuth();
  const [view, setView] = useState<View>('home');

  // When session is lost, navigate back to home
  React.useEffect(() => {
    if (!session) {
      setView('home');
    }
  }, [session]);

  const navigate = (newView: View) => {
    setView(newView);
  };
  
  const renderContent = () => {
      if (loading) {
          return <LoadingScreen />;
      }
      if (!session || !profile) {
          return <Auth />;
      }
      switch(view) {
          case 'admin':
              return profile.is_admin
                ? <AdminDashboard onNavigateHome={() => navigate('home')} />
                : <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} />;
          case 'profile':
              return <ProfilePage onNavigateHome={() => navigate('home')} />;
          case 'home':
          default:
              return <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} />;
      }
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      {renderContent()}
    </div>
  );
};

export default App;