import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Order } from '../../types';
import { TablesUpdate } from '../../integrations/supabase/types';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

const OrderListPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching orders:", error.message);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        const updateData: TablesUpdate<'orders'> = { status: newStatus };
        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);
        if (error) {
            alert("Error updating status: " + error.message);
        } else {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        }
    };
    
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div>
            <h1 className="text-3xl font-bold font-display mb-6">Orders</h1>

            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}

            <div className="bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                {loading ? <p>Loading orders...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-text-muted">
                            <thead className="text-xs text-gray-700 dark:text-text-primary uppercase bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Total</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="bg-white dark:bg-accent border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-text-primary">#{order.id}</td>
                                        <td className="px-6 py-4">{order.profiles?.full_name || 'Guest'}</td>
                                        <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">${order.total_amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()} // Prevent row click
                                                className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleViewDetails(order)} className="font-medium text-primary hover:underline">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderListPage;