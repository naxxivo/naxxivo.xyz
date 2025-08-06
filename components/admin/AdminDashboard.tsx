import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="text-3xl mr-4">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: paymentsCount } = await supabase.from('manual_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                const { data: approvedPayments } = await supabase.from('manual_payments').select('amount').eq('status', 'approved');
                const { count: subsCount } = await supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true);

                const totalRevenue = (approvedPayments as {amount: number}[])?.reduce((acc, p) => acc + p.amount, 0) || 0;

                setStats({
                    totalUsers: usersCount || 0,
                    pendingPayments: paymentsCount || 0,
                    totalRevenue: totalRevenue,
                    activeSubscriptions: subsCount || 0,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
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