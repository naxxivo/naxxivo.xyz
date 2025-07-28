
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pb, getAvatarUrl, getCoverUrl } from '../services/pocketbase';
import { Spinner } from './Spinner';
import { PlusIcon } from './icons/PlusIcon';

const ProfileStat: React.FC<{ count: number; label: string }> = ({ count, label }) => (
    <div className="text-center">
        <span className="font-bold text-lg text-text-primary">{count}</span>
        <p className="text-xs text-text-secondary">{label}</p>
    </div>
);

export const LeftSidebar: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<{ posts: number; followers: number; following: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const postsPromise = pb.collection('posts').getList(1, 1, { filter: `user = "${user.id}"`, requestKey: null });
                const followersPromise = pb.collection('follows').getList(1, 1, { filter: `following = "${user.id}"`, requestKey: null });
                const followingPromise = pb.collection('follows').getList(1, 1, { filter: `follower = "${user.id}"`, requestKey: null });

                const results = await Promise.allSettled([postsPromise, followersPromise, followingPromise]);
                
                const postsResult = results[0];
                const followersResult = results[1];
                const followingResult = results[2];

                setStats({
                    posts: postsResult.status === 'fulfilled' ? postsResult.value.totalItems : 0,
                    followers: followersResult.status === 'fulfilled' ? followersResult.value.totalItems : 0,
                    following: followingResult.status === 'fulfilled' ? followingResult.value.totalItems : 0,
                });
                
                results.forEach((result, i) => {
                    if (result.status === 'rejected') {
                        const name = ['posts', 'followers', 'following'][i];
                        console.error(`Failed to fetch ${name} stats:`, result.reason);
                    }
                });

            } catch (error) {
                console.error("An unexpected error occurred while fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (!user) {
        return null;
    }
    
    const usernameDisplay = user.name ? user.name.toLowerCase().replace(/\s+/g, '') : user.id;

    return (
        <aside className="sticky top-24 space-y-6">
            <div className="bg-surface rounded-2xl shadow-xl text-center overflow-hidden">
                <div className="h-24 bg-secondary">
                    <img src={getCoverUrl(user)} alt="cover" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 -mt-12">
                    <Link to="/profile">
                        <img src={getAvatarUrl(user)} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-surface mx-auto" />
                    </Link>
                    <Link to="/profile" className="block text-xl font-bold text-text-primary mt-2 hover:underline">
                        {user.name}
                    </Link>
                    <p className="text-sm text-text-secondary">@{usernameDisplay}</p>
                </div>
                <div className="flex justify-around items-center border-t border-border p-4">
                    {loading ? (
                        <Spinner size="sm" />
                    ) : stats ? (
                        <>
                            <ProfileStat count={stats.posts} label="Posts" />
                            <ProfileStat count={stats.followers} label="Followers" />
                            <ProfileStat count={stats.following} label="Following" />
                        </>
                    ) : (
                        <p className="text-sm text-text-secondary">Could not load stats.</p>
                    )}
                </div>
            </div>

            <Link to="/create-post" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                <PlusIcon className="w-5 h-5"/>
                <span>Create Post</span>
            </Link>
        </aside>
    );
};
