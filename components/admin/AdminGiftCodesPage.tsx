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
        } catch (err: any) {
            alert(`Save failed: ${err.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-gray-200">Gift Code Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Create New Code
                </button>
            </div>
             {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP Reward</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {codes.map(code => (
                                <tr key={code.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-200">{code.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.xp_reward}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.uses_remaining ?? '∞'} / {code.max_uses ?? '∞'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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