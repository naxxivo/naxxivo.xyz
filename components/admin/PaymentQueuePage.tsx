import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, Json } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import PaymentReviewModal from './PaymentReviewModal';

export type PaymentWithDetails = Tables<'manual_payments'> & {
    profiles: Pick<Tables<'profiles'>, 'name' | 'username'> | null;
    products: Pick<Tables<'products'>, 'id' | 'name' | 'product_type' | 'price' | 'details'> | null;
};

const PaymentQueuePage: React.FC<{ session: Session }> = ({ session }) => {
    const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

    const fetchPendingPayments = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_pending_payments_admin');

            if (error) throw error;
            
            // The data from RPC is already joined. We just cast it to our display type.
            setPayments(data as any || []);

        } catch (error: any) {
            console.error("Failed to fetch payments:", error.message || error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : payments.length === 0 ? (
                <p className="dark:text-gray-300">No pending payments to review.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{payment.profiles?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{payment.products?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(payment.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedPayment(payment)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedPayment && (
                <PaymentReviewModal 
                    session={session}
                    payment={selectedPayment} 
                    onClose={() => setSelectedPayment(null)} 
                    onUpdate={() => {
                        fetchPendingPayments();
                        setSelectedPayment(null);
                    }}
                />
            )}
        </div>
    );
};

export default PaymentQueuePage;