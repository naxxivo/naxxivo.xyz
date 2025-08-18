import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import PermissionsModal from './components/PermissionsModal';
import AdminPanel from './components/AdminPanel';
import AdminUserDetail from './components/AdminUserDetail';

type View = 'profile' | 'admin_list' | 'admin_detail';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  const [view, setView] = useState<View>('profile');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
        if (_event === 'SIGNED_IN') {
          setShowPermissionsModal(true);
        }
      } else {
        setUserRole(null);
        setView('profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setView('admin_detail');
  };

  const renderContent = () => {
    if (!session) {
      return <Login />;
    }
    
    switch(view) {
        case 'admin_list':
            return <AdminPanel onSelectUser={handleSelectUser} onBack={() => setView('profile')} />;
        case 'admin_detail':
            if (!selectedUserId) return null; // Should not happen
            return <AdminUserDetail userId={selectedUserId} onBack={() => setView('admin_list')} />;
        case 'profile':
        default:
            return (
              <UserProfile 
                session={session} 
                isAdmin={userRole === 'admin'}
                onAdminClick={() => setView('admin_list')}
              />
            );
    }
  };

  if (loading) {
     return <div className="min-h-screen w-full flex items-center justify-center bg-slate-900"><p className="text-white">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 font-sans">
      {renderContent()}
      <PermissionsModal 
        isOpen={showPermissionsModal} 
        onClose={() => setShowPermissionsModal(false)} 
      />
    </div>
  );
};

export default App;
