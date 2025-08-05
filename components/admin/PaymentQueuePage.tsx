import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Tables, Enums, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';

type Payment = Tables<'manual_payments'> & {
    profiles: Pick<Tables<'profiles'>, 'name' | 'username'> | null;
    products: Pick<Tables<'products'>, 'name'> | null;
};

const PaymentReviewModal = ({ payment, onClose, onUpdate }: { payment: Payment; onClose: () => void; onUpdate: () => void; }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    const handleUpdate = async (newStatus: Enums<'payment_status'>) => {
        setIsProcessing(true);
        try {
            const updatePayload: TablesUpdate<'manual_payments'> = {
                status: newStatus,
                reviewed_at: new Date().toISOString(),
                admin_notes: notes || null,
            };
            const { error } = await supabase.from('manual_payments').update(updatePayload).eq('id', payment.id);

            if (error) throw error;
            
            // TODO: In a real app, you would call a serverless function here to award XP/subscriptions
            // if (newStatus === 'approved') { ... }

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update payment:", error);
            alert("Failed to update payment status.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold mb-4">Review Payment</h2>
                <div className="space-y-4">
                    <p><strong>User:</strong> {payment.profiles?.name} (@{payment.profiles?.username})</p>
                    <p><strong>Product:</strong> {payment.products?.name || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${payment.amount.toFixed(2)}</p>
                    <p><strong>Sender Details:</strong> {payment.sender_details}</p>
                    <div>
                        <strong>Screenshot:</strong>
                        {payment.screenshot_url ? (
                            <img src={payment.screenshot_url} alt="Payment Screenshot" className="mt-2 rounded-md border max-h-80" />
                        ) : (
                            <p className="text-gray-500">No screenshot provided.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700">Admin Notes (for rejection)</label>
                        <textarea
                            id="admin_notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={() => handleUpdate('rejected')} disabled={isProcessing} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300">Reject</button>
                    <button onClick={() => handleUpdate('approved')} disabled={isProcessing} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300">Approve</button>
                </div>
            </div>
        </div>
    );
};

const PaymentQueuePage: React.FC<{ session: Session }> = ({ session }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const fetchPendingPayments = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('manual_payments')
            .select(`*, profiles (name, username), products (name)`)
            .eq('status', 'pending')
            .order('created_at');
        
        if (error) {
            console.error("Failed to fetch payments:", error);
        } else {
            setPayments(data as Payment[] || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPendingPayments();
    }, [fetchPendingPayments]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : payments.length === 0 ? (
                <p>No pending payments to review.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.profiles?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.products?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedPayment(payment)} className="text-indigo-600 hover:text-indigo-900">Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedPayment && (
                <PaymentReviewModal 
                    payment={selectedPayment} 
                    onClose={() => setSelectedPayment(null)} 
                    onUpdate={() => {
                        fetchPendingPayments();
                    }}
                />
            )}
        </div>
    );
};

export default PaymentQueuePage;
