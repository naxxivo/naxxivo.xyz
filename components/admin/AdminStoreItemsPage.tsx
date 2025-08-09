import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, TablesUpdate, TablesInsert } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import StoreItemFormModal from './StoreItemFormModal';

type StoreItem = Tables<'store_items'>;

interface AdminStoreItemsPageProps {
    session: Session;
}

const AdminStoreItemsPage: React.FC<AdminStoreItemsPageProps> = ({ session }) => {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('store_items').select('*').order('created_at');
        if (error) {
            console.error("Failed to fetch store items:", error);
            alert(`Error: ${error.message}`);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleCreateNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: StoreItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (itemData: Partial<StoreItem>) => {
        try {
            const payload: TablesUpdate<'store_items'> = {
                name: itemData.name,
                description: itemData.description,
                category: itemData.category,
                price: Number(itemData.price) || 0,
                preview_url: itemData.preview_url,
                asset_details: itemData.asset_details,
                is_active: itemData.is_active,
                is_approved: itemData.is_approved,
            };
            
            if (editingItem) { // If we are editing, update the existing item
                const { error } = await supabase
                    .from('store_items')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else { // Otherwise, insert a new item
                const insertPayload: TablesInsert<'store_items'> = {
                    name: payload.name!,
                    category: payload.category!,
                    description: payload.description,
                    price: payload.price,
                    preview_url: payload.preview_url,
                    asset_details: payload.asset_details,
                    is_active: payload.is_active,
                    is_approved: payload.is_approved,
                    created_by_user_id: null, // Admin-created items
                };
                const { error } = await supabase
                    .from('store_items')
                    .insert(insertPayload);
                if (error) throw error;
            }
            
            setIsModalOpen(false);
            await fetchItems();
        } catch (error: any) {
            console.error('Failed to save store item:', error);
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bazaar Items</h2>
                <button 
                    onClick={handleCreateNew}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    Create New Item
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10"><LoadingSpinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Price (XP)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-200">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 capitalize">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'
                                        }`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 font-semibold">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <StoreItemFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveItem}
                    itemToEdit={editingItem}
                />
            )}
        </div>
    );
};

export default AdminStoreItemsPage;