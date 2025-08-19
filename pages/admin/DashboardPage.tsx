
import React, { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface KpiData {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
}

const KpiCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-sm font-medium text-gray-500 dark:text-text-muted">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-text-primary">{value}</p>
    </div>
);

const DashboardPage: React.FC = () => {
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKpis = async () => {
            setLoading(true);
            try {
                // Fetch total revenue
                const { data: revenueData, error: revenueError } = await supabase
                    .from('orders')
                    .select('total_amount');
                if (revenueError) throw revenueError;
                const totalRevenue = (revenueData || []).reduce((sum, order) => sum + order.total_amount, 0);

                // Fetch total orders
                const { count: totalOrders, error: ordersError } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true });
                if (ordersError) throw ordersError;

                // Fetch total customers
                const { count: totalCustomers, error: customersError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });
                if (customersError) throw customersError;

                setKpiData({
                    totalRevenue,
                    totalOrders: totalOrders || 0,
                    totalCustomers: totalCustomers || 0,
                });
            } catch (error: any) {
                console.error("Error fetching KPIs:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchKpis();
    }, []);

    if (loading) {
        return <p>Loading dashboard data...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-display mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Revenue" value={`$${kpiData?.totalRevenue.toFixed(2) || '0.00'}`} />
                <KpiCard title="Total Orders" value={kpiData?.totalOrders || 0} />
                <KpiCard title="Total Customers" value={kpiData?.totalCustomers || 0} />
            </div>
        </div>
    );
};

export default DashboardPage;