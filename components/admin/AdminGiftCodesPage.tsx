import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, TablesInsert } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import GiftCodeFormModal from './GiftCodeFormModal';

type GiftCode = Tables<'gift_codes'>;

const AdminGiftCodesPage: React.FC<{ session: Session }> = ({ session }) => {
    const [codes, setCodes] = useState<GiftCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCodes = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('gift_codes').select('*').order('created_at', { ascending: false });
        if (error) {
            alert(`Error fetching codes: ${error.message}`);
        } else {
            setCodes(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);
    
    const handleSaveCode = async (codeData: Partial<GiftCode>) => {
        try {
            const payload = {
                ...codeData,
                created_by: session.user.id,
                uses_remaining: codeData.max_uses, // Initialize remaining uses
            };
            const { error } = await supabase.from('gift_codes').insert(payload as any);
            if (error) throw error;
            setIsModalOpen(false);
            await fetchCodes();
        } catch (error: any) {
            console.error('Save failed:', error);
            let detailMessage = 'An unknown error occurred.';
            if (error) {
                if (error.message) {
                    detailMessage = `Message: ${error.message}`;
                    if (error.details) detailMessage += `\nDetails: ${error.details}`;
                    if (error.hint) detailMessage += `\nHint: ${error.hint}`;
                    if (error.code) detailMessage += `\nCode: ${error.code}`;
                } else {
                    try {
                        detailMessage = JSON.stringify(error, null, 2);
                    } catch {
                        detailMessage = "Could not stringify the error object. Check the console for more details.";
                    }
                }
            }
            alert(`Save failed: ${detailMessage}`);
        }
    };

    return (
        <div className="bg-[var(--theme-card-bg)] p-6 rounded-xl shadow-lg border border-[var(--theme-secondary)]">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[var(--theme-text)]">Gift Code Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    Create New Code
                </button>
            </div>
             {loading ? (
                <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
            ) : (
                 <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead className="admin-thead">
                            <tr>
                                <th className="admin-th">Code</th>
                                <th className="admin-th">XP Reward</th>
                                <th className="admin-th">Uses</th>
                                <th className="admin-th">Expires</th>
                                <th className="admin-th">Status</th>
                            </tr>
                        </thead>
                        <tbody className="admin-tbody">
                            {codes.map(code => (
                                <tr key={code.id} className="admin-tr">
                                    <td className="admin-td font-mono text-[var(--theme-text)]">{code.code}</td>
                                    <td className="admin-td text-[var(--theme-text-secondary)]">{code.xp_reward.toLocaleString()}</td>
                                    <td className="admin-td text-[var(--theme-text-secondary)]">{code.uses_remaining ?? '∞'} / {code.max_uses ?? '∞'}</td>
                                    <td className="admin-td text-[var(--theme-text-secondary)]">{code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="admin-td">
                                        <span className={`status-badge ${code.is_active ? 'status-badge-active' : 'status-badge-inactive'}`}>
                                            {code.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <GiftCodeFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCode}
                />
            )}
        </div>
    );
};

export default AdminGiftCodesPage;