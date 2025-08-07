import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className="text-3xl mr-4">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const { data, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');

                if (rpcError) throw rpcError;
                
                if (data) {
                    setStats(data as any);
                }
            } catch (err: any) {
                console.error("Failed to fetch dashboard stats:", err);
                setError(err.message || "An unexpected error occurred while fetching dashboard data.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4" role="alert">
                <p className="font-bold">Error Loading Dashboard</p>
                <p>{error}</p>
                <p className="text-sm mt-2">This is likely due to incorrect database permissions (RLS). Please ensure you have run the latest SQL script provided to fix database policies and functions.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
            <StatCard title="Pending Payments" value={stats.pendingPayments} icon="⏳" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon="💰" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon="🔄" />
        </div>
    );
};

export default AdminDashboard;