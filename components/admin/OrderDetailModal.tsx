import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../../types';
import { supabase } from '../../integrations/supabase/client';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderItems = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', order.id);
            
            if (error) {
                console.error("Error fetching order items:", error);
            } else {
                setItems(data as OrderItem[] || []);
            }
            setLoading(false);
        };
        fetchOrderItems();
    }, [order.id]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start p-4 pt-16 overflow-y-auto">
            <div className="bg-white dark:bg-accent rounded-lg shadow-xl w-full max-w-3xl relative border border-gray-200 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-text-muted hover:text-gray-900 dark:hover:text-text-primary text-2xl leading-none">&times;</button>
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold font-display">Order Details #{order.id}</h2>
                    <p className="text-sm text-gray-600 dark:text-text-muted">
                        Customer: {order.profiles?.full_name || 'N/A'}
                    </p>
                </div>
                <div className="p-6">
                    <h3 className="font-semibold mb-4">Items in this Order</h3>
                    {loading ? <p>Loading items...</p> : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center space-x-4 p-2 rounded-md bg-gray-100 dark:bg-slate-800/50">
                                    <img src={item.products?.image_url || ''} alt={item.products?.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-medium">{item.products?.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-text-muted">Qty: {item.quantity} @ ${item.price_at_purchase.toFixed(2)}</p>
                                        {item.products?.is_external && (
                                            <a 
                                                href={item.products.source_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-semibold text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50 px-2 py-1 rounded-full inline-block mt-1 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
                                            >
                                                External Product - View Source
                                            </a>
                                        )}
                                    </div>
                                    <p className="font-semibold">${(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 text-right">
                        <span className="font-bold text-xl">Total: ${order.total_amount.toFixed(2)}</span>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-b-lg text-right">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-text-primary font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;