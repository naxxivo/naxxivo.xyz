

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { AnimeLoader } from '../components/ui/Loader';
import PageTransition from '../components/ui/PageTransition';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../App';

const UserCard: React.FC<{ profile: Profile }> = ({ profile }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile.username || 'default'}`;

    const handleStartConversation = () => {
        if (!currentUser || currentUser.id === profile.id) return;
        navigate(`/messages/${profile.id}`);
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-pink/30 will-change-transform text-center">
            <Link to={`/profile/${profile.id}`}>
                <img 
                    src={profile.photo_url || defaultAvatar} 
                    alt={profile.name || 'user'} 
                    className="w-24 h-24 rounded-full border-4 border-primary-pink object-cover mx-auto mb-4"
                />
            </Link>
            <Link to={`/profile/${profile.id}`} className="font-bold text-lg text-black hover:text-primary-pink transition-colors break-words">
                {profile.name || profile.username}
            </Link>
            <p className="text-sm text-black/60">@{profile.username}</p>
            {currentUser && currentUser.id !== profile.id && (
                 <button onClick={handleStartConversation} className="mt-4 text-primary-blue hover:text-primary-pink transition-colors" title={`Message ${profile.name || profile.username}`}>
                    <EnvelopeIcon className="h-8 w-8 mx-auto" />
                </button>
            )}
        </div>
    );
};


const UsersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError("Could not load users.");
        setProfiles([]);
      } else {
        setProfiles((data as any[]) || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return (
    <PageTransition>
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold from-primary-pink to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
          Find Other Users
        </h1>
        <p className="text-lg text-black/80">Connect with the NAXXIVO community!</p>
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {profiles.map((profile) => (
            <UserCard key={profile.id} profile={profile} />
          ))}
          {profiles.length === 0 && <p className="text-center col-span-full">No users found.</p>}
        </div>
      )}
    </PageTransition>
  );
};

export default UsersPage;
