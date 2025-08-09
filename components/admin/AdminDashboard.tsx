import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import { ProfileIcon, CreditCardIcon, CoinIcon, CheckCircleIcon } from '../common/AppIcons';

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-4 transition-all hover:shadow-xl hover:-translate-y-1">
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
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
            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg" role="alert">
                <p className="font-bold">Error Loading Dashboard</p>
                <p>{error}</p>
                <p className="text-sm mt-2">This is likely due to incorrect database permissions (RLS). Please ensure you have run the latest SQL script provided to fix database policies and functions.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon={<ProfileIcon className="w-8 h-8"/>} color="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" />
            <StatCard title="Pending Payments" value={stats.pendingPayments} icon={<CreditCardIcon className="w-8 h-8"/>} color="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<CoinIcon className="w-8 h-8"/>} color="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={<CheckCircleIcon className="w-8 h-8"/>} color="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" />
        </div>
    );
};

export default AdminDashboard;
