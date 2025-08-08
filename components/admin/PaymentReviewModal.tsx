import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Enums, TablesUpdate, TablesInsert, Json } from '../../integrations/supabase/types';
import type { PaymentWithDetails } from './PaymentQueuePage';
import LoadingSpinner from '../common/LoadingSpinner';

interface PaymentReviewModalProps {
    payment: PaymentWithDetails;
    onClose: () => void;
    onUpdate: () => void;
    session: Session;
}

const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({ payment, onClose, onUpdate, session }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    const handleUpdate = async (newStatus: Enums<'payment_status'>) => {
        setIsProcessing(true);
        try {
            if (newStatus === 'approved') {
                if (!payment.products) {
                    throw new Error("Product details not found. Cannot process approval.");
                }
    
                const product = payment.products;
                const productDetails = product.details as any;
                const userId = payment.user_id;
                
                if (product.product_type === 'subscription' && productDetails?.duration_days) {
                    const startDate = new Date();
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + productDetails.duration_days);

                    const newSubscription: TablesInsert<'user_subscriptions'> = {
                        user_id: userId,
                        product_id: product.id,
                        payment_id: payment.id,
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        is_active: true,
                    };
                    const { error: subError } = await supabase.from('user_subscriptions').insert(newSubscription as any);
                    if (subError) throw new Error(`Failed to create subscription: ${subError.message}`);
                }
                
                const xpToAdd = (product.product_type === 'package' ? productDetails?.xp_amount : productDetails?.initial_xp) || 0;
                
                if (xpToAdd > 0) {
                     const { error: rpcError } = await supabase.rpc('add_xp_to_user', {
                        user_id_to_update: userId,
                        xp_to_add: xpToAdd
                     });
                     if(rpcError) throw new Error(`Failed to update user XP: ${rpcError.message}`);
                }
                
                const finalNotes = notes || `Approved and awarded: ${product.name}`;
                const updatePayload: TablesUpdate<'manual_payments'> = { status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: session.user.id, admin_notes: finalNotes };
                const { error } = await supabase.from('manual_payments').update(updatePayload as any).eq('id', payment.id);
                if (error) {
                    throw new Error(`CRITICAL: User ${userId} was awarded product ${product.id}, but failed to update payment status. Please manually set payment ${payment.id} to 'approved'.`);
                }
                
                // Send notification for approval
                const notification: TablesInsert<'notifications'> = {
                    user_id: userId,
                    type: 'PAYMENT_APPROVED',
                    entity_id: String(payment.id),
                    content: { productName: product.name, amount: payment.amount }
                };
                await supabase.from('notifications').insert(notification as any);

            } else { // Logic for 'rejected'
                const finalNotes = notes || 'Your payment was rejected. Please ensure the screenshot and details are correct.';
                const updatePayload: TablesUpdate<'manual_payments'> = { status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: session.user.id, admin_notes: finalNotes };
                const { error } = await supabase.from('manual_payments').update(updatePayload as any).eq('id', payment.id);
                if (error) throw error;
                
                 // Send notification for rejection
                const notification: TablesInsert<'notifications'> = {
                    user_id: payment.user_id,
                    type: 'PAYMENT_REJECTED',
                    entity_id: String(payment.id),
                    content: { productName: payment.products?.name || 'your purchase', amount: payment.amount, reason: finalNotes }
                };
                await supabase.from('notifications').insert(notification as any);
            }

            onUpdate();
        } catch (error: any) {
            console.error("Failed to update payment:", error);
            alert(`Failed to update payment status: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full flex flex-col">
                <header className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-gray-200">Review Payment</h2>
                </header>
                <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-gray-800 dark:text-gray-300">
                    <p><strong>User:</strong> {payment.profiles?.name} (@{payment.profiles?.username})</p>
                    <p><strong>Product:</strong> {payment.products?.name || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${payment.amount.toFixed(2)}</p>
                    <p><strong>Sender Details:</strong> {payment.sender_details}</p>
                    <div>
                        <strong>Screenshot:</strong>
                        {payment.screenshot_url ? (
                            <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer">
                                <img src={payment.screenshot_url} alt="Payment Screenshot" className="mt-2 rounded-md border dark:border-gray-600 max-h-80 hover:ring-2 hover:ring-violet-500" />
                            </a>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No screenshot provided.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes</label>
                        <textarea
                            id="admin_notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md"
                            rows={2}
                            placeholder="Reason for rejection or approval notes..."
                        />
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t dark:border-gray-700">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700" disabled={isProcessing}>Cancel</button>
                    <button onClick={() => handleUpdate('rejected')} disabled={isProcessing} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300">
                        {isProcessing ? <LoadingSpinner/> : 'Reject'}
                    </button>
                    <button onClick={() => handleUpdate('approved')} disabled={isProcessing} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300">
                        {isProcessing ? <LoadingSpinner/> : 'Approve'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PaymentReviewModal;