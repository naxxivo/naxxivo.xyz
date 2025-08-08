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
        } catch (err: any) {
             console.error('Failed to save store item:', err);
             const errorMessage = err.message || JSON.stringify(err);
             alert(`Save failed: ${errorMessage}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-gray-200">Bazaar Items</h2>
                <button 
                    onClick={handleCreateNew}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Create New Item
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center"><LoadingSpinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price (XP)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
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