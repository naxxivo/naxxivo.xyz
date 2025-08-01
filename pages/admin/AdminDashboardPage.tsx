


import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import StatCard from '../../components/admin/StatCard';
import { AnimeLoader } from '../../components/ui/Loader';
import { UsersIcon, NewspaperIcon, ShoppingBagIcon, TvIcon } from '@heroicons/react/24/solid';

interface Stats {
    users: number;
    posts: number;
    products: number;
    series: number;
}

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [
                    { count: users, error: usersError },
                    { count: posts, error: postsError },
                    { count: products, error: productsError },
                    { count: series, error: seriesError },
                ] = await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('posts').select('id', { count: 'exact', head: true }),
                    supabase.from('market_products').select('id', { count: 'exact', head: true }),
                    supabase.from('anime_series').select('id', { count: 'exact', head: true }),
                ]);
                
                if (usersError || postsError || productsError || seriesError) {
                    throw new Error('Failed to fetch one or more statistics.');
                }

                setStats({
                    users: users || 0,
                    posts: posts || 0,
                    products: products || 0,
                    series: series || 0,
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <AnimeLoader />;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-4xl font-display font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats?.users ?? 0} icon={UsersIcon} />
                <StatCard title="Total Posts" value={stats?.posts ?? 0} icon={NewspaperIcon} />
                <StatCard title="Marketplace Items" value={stats?.products ?? 0} icon={ShoppingBagIcon} />
                <StatCard title="Anime Series" value={stats?.series ?? 0} icon={TvIcon} />
            </div>
            
            {/* Future charts or activity feeds can go here */}
        </div>
    );
};

export default AdminDashboardPage;