import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import { Link } from 'react-router-dom';
import RankBadge from '../components/ui/RankBadge';
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
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  }
};

const LeaderboardPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, name, photo_url, role, xp_balance, created_at, bio, cover_url, address, website_url, youtube_url, facebook_url')
                .order('xp_balance', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Error fetching leaderboard:', error);
                setError("Could not load the leaderboard.");
            } else {
                setUsers(data || []);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    const defaultAvatar = (seed: string | null) => `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed || 'default'}`;

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
                        Global Leaderboard
                    </h1>
                    <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
                        See who's at the top of the ranks!
                    </p>
                </div>

                {loading ? <AnimeLoader /> : error ? <p className="text-center text-red-500">{error}</p> : (
                    <motion.div 
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {users.map((user, index) => (
                            <motion.div key={user.id} variants={itemVariants}>
                                <Link to={`/profile/${user.id}`}>
                                    <div className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg p-3 transition-all duration-300 ease-out flex items-center space-x-4 hover:shadow-2xl hover:shadow-primary-pink/30 dark:hover:shadow-accent/20 hover:scale-[1.02]">
                                        <div className="flex items-center justify-center w-12 font-bold text-2xl text-secondary-purple/50 dark:text-dark-text/50">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <RankBadge xp={user.xp_balance} size="md" />
                                        </div>
                                        <img 
                                            src={user.photo_url || defaultAvatar(user.username)}
                                            alt={user.name || 'user'}
                                            className="w-16 h-16 rounded-full border-4 border-primary-blue object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg text-secondary-purple dark:text-dark-text break-words">
                                                {user.name || user.username}
                                            </p>
                                            <p className="text-sm text-secondary-purple/70 dark:text-dark-text/70">@{user.username}</p>
                                        </div>
                                        <div className="text-right pr-4">
                                            <p className="font-bold text-xl text-accent">{user.xp_balance.toLocaleString()} XP</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

export default LeaderboardPage;
