import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, Enums } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

type StoreItem = Tables<'store_items'>;

interface StoreItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (itemData: Partial<StoreItem>) => void;
    itemToEdit: StoreItem | null;
}

const StoreItemFormModal: React.FC<StoreItemFormModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState<Partial<StoreItem>>({
        name: '',
        description: '',
        category: 'PROFILE_FX',
        price: 0,
        preview_url: '',
        asset_details: {},
        is_active: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (itemToEdit) {
            setFormData(itemToEdit);
        } else {
            setFormData({
                name: '', description: '', category: 'PROFILE_FX', price: 0,
                preview_url: '', asset_details: {}, is_active: true,
            });
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        try {
            const parsed = JSON.parse(value);
            setFormData(prev => ({ ...prev, [name]: parsed }));
        } catch (error) {
            console.error("Invalid JSON in asset_details");
            // Optionally, show an error to the user
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold dark:text-gray-200">{itemToEdit ? 'Edit Item' : 'Create New Item'}</h2>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <Input id="name" label="Item Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700">
                                            <option value="PROFILE_FX">Profile FX</option>
                                            <option value="THEME">Theme</option>
                                            <option value="BADGE">Badge</option>
                                        </select>
                                    </div>
                                    <Input id="price" label="Price (XP)" name="price" type="number" value={String(formData.price) || '0'} onChange={handleChange} required />
                                </div>
                                <Input id="preview_url" label="Preview URL" name="preview_url" value={formData.preview_url || ''} onChange={handleChange} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Details (JSON)</label>
                                    <textarea name="asset_details" value={JSON.stringify(formData.asset_details, null, 2) || ''} onChange={handleJsonChange} rows={4} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 font-mono text-sm" />
                                </div>
                                <div className="flex items-center">
                                    <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={e => setFormData(p => ({...p, is_active: e.target.checked}))} className="h-4 w-4 rounded" />
                                    <label htmlFor="is_active" className="ml-2 block text-sm">Item is Active</label>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto">Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="w-auto">
                                    {isSaving ? <LoadingSpinner /> : 'Save Item'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StoreItemFormModal;
