import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import { generateAvatar } from '../../utils/helpers';

type CoverForApproval = Tables<'store_items'> & {
    profiles: { name: string, username: string, photo_url: string | null } | null;
};

const AdminCoverApprovalPage: React.FC<{ session: Session }> = ({ session }) => {
    const [covers, setCovers] = useState<CoverForApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPendingCovers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_items')
                .select('*, profiles:created_by_user_id(name, username, photo_url)')
                .eq('is_approved', false)
                .eq('category', 'PROFILE_COVER')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCovers((data as any) || []);
        } catch (error: any) {
            alert(`Failed to fetch covers: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingCovers();
    }, [fetchPendingCovers]);

    const handleApproval = async (itemId: number, shouldApprove: boolean) => {
        setProcessingId(itemId);
        try {
            if (shouldApprove) {
                const { error } = await supabase
                    .from('store_items')
                    .update({ is_approved: true, is_active: true } as any)
                    .eq('id', itemId);
                if (error) throw error;
            } else {
                // To reject, we delete the item. Consider deleting from storage too.
                const { error } = await supabase
                    .from('store_items')
                    .delete()
                    .eq('id', itemId);
                if (error) throw error;
            }
            await fetchPendingCovers();
        } catch (error: any) {
            alert(`Action failed: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold dark:text-gray-200 mb-4">Profile Cover Approvals</h2>
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : covers.length === 0 ? (
                <p className="dark:text-gray-300">No pending covers to review.</p>
            ) : (
                <div className="space-y-4">
                    {covers.map(cover => (
                        <div key={cover.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                <img src={cover.preview_url || undefined} alt="Cover Preview" className="w-full h-full object-contain"/>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg dark:text-gray-200">{cover.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{cover.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <img src={cover.profiles?.photo_url || generateAvatar(cover.profiles?.username || '')} className="w-6 h-6 rounded-full" alt="creator avatar"/>
                                    <span>{cover.profiles?.name || cover.profiles?.username}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => handleApproval(cover.id, true)}
                                    disabled={processingId === cover.id}
                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-green-300"
                                >
                                    {processingId === cover.id ? <LoadingSpinner/> : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleApproval(cover.id, false)}
                                    disabled={processingId === cover.id}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-red-300"
                                >
                                    {processingId === cover.id ? '...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCoverApprovalPage;