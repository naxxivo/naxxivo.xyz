
import React, { useState, useEffect } from 'react';
import { supabase } from '@/locales/en/pages/services/supabase';
import { Profile } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import { AnimeLoader } from '@/components/ui/Loader';
import PageTransition from '@/components/ui/PageTransition';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/App';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
  }
};

const UserCard: React.FC<{ profile: Profile }> = ({ profile }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${profile.username || 'default'}`;

    const handleStartConversation = () => {
        if (!currentUser || currentUser.id === profile.id) return;
        navigate(`/messages/${profile.id}`);
    };

    return (
        <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-pink/30 dark:hover:shadow-accent/20 will-change-transform text-center">
            <Link to={`/profile/${profile.id}`}>
                <img 
                    src={profile.photo_url || defaultAvatar} 
                    alt={profile.name || 'user'} 
                    className="w-24 h-24 rounded-full border-4 border-accent object-cover mx-auto mb-4"
                />
            </Link>
            <Link to={`/profile/${profile.id}`} className="font-bold text-lg text-secondary-purple dark:text-dark-text hover:text-accent transition-colors break-words">
                {profile.name || profile.username}
            </Link>
            <p className="text-sm text-secondary-purple/60 dark:text-dark-text/70">@{profile.username}</p>
            {currentUser && currentUser.id !== profile.id && (
                 <button onClick={handleStartConversation} className="mt-4 text-primary-blue hover:text-accent transition-colors" title={`Message ${profile.name || profile.username}`}>
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
        .select('id, username, name, photo_url, role, created_at, bio, cover_url, address, website_url, youtube_url, facebook_url')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError("Could not load users.");
        setProfiles([]);
      } else {
        setProfiles((data as unknown as Profile[]) || []);
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
        <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">Connect with the NAXXIVO community!</p>
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {profiles.map((profile) => (
             <motion.div key={profile.id} variants={itemVariants}>
              <UserCard profile={profile} />
            </motion.div>
          ))}
          {profiles.length === 0 && <p className="text-center col-span-full">No users found.</p>}
        </motion.div>
      )}
    </PageTransition>
  );
};

export default UsersPage;