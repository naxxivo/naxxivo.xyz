import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, Enums, Json } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import CoverEditorModal from './CoverEditorModal';

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
        category: 'PROFILE_COVER',
        price: 0,
        preview_url: '',
        asset_details: null,
        is_active: true,
    });
    const [assetDetailsStr, setAssetDetailsStr] = useState('null');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        if (itemToEdit) {
            setFormData(itemToEdit);
            setAssetDetailsStr(JSON.stringify(itemToEdit.asset_details, null, 2));
        } else {
            setFormData({
                name: '', description: '', category: 'PROFILE_COVER', price: 0,
                preview_url: '', asset_details: null, is_active: true, is_approved: true
            });
            setAssetDetailsStr('null');
        }
        setJsonError(null);
    }, [itemToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAssetDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setAssetDetailsStr(value);
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch (error) {
            setJsonError('Invalid JSON format.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (jsonError) {
            alert('Cannot save. Asset Details contains invalid JSON.');
            return;
        }

        let parsedAssetDetails: Json;
        try {
            parsedAssetDetails = JSON.parse(assetDetailsStr);
        } catch (error) {
            setJsonError('Invalid JSON format. Please fix before saving.');
            return;
        }

        setIsSaving(true);
        await onSave({ ...formData, asset_details: parsedAssetDetails, category: 'PROFILE_COVER' });
        setIsSaving(false);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && !isEditorOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
                        <motion.div
                            {...{
                                initial: { opacity: 0, y: -50 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: 50 },
                            } as any}
                            className="bg-[var(--theme-card-bg)] rounded-lg shadow-xl max-w-2xl w-full flex flex-col border border-[var(--theme-secondary)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 border-b border-[var(--theme-secondary)]">
                                    <h2 className="text-xl font-bold text-[var(--theme-text)]">{itemToEdit ? 'Edit Item' : 'Create New Item'}</h2>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <Input id="name" label="Item Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Description</label>
                                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="admin-textarea" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Category</label>
                                            <input 
                                                type="text" 
                                                value="Profile Cover" 
                                                readOnly 
                                                className="w-full p-2.5 border rounded-md bg-[var(--theme-card-bg-alt)]/50 border-[var(--theme-secondary)] text-[var(--theme-text-secondary)]" 
                                            />
                                        </div>
                                        <Input id="price" label="Price (XP)" name="price" type="number" value={String(formData.price) || '0'} onChange={handleChange} required />
                                    </div>
                                    <Input id="preview_url" label="Preview URL" name="preview_url" value={formData.preview_url || ''} onChange={handleChange} />
                                    
                                    {formData.category === 'PROFILE_COVER' && (
                                        <div className="text-center py-2">
                                            <Button type="button" variant="secondary" onClick={() => setIsEditorOpen(true)} className="w-auto">
                                                Open Visual Editor
                                            </Button>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Asset Details (JSON)</label>
                                        <textarea 
                                            name="asset_details" 
                                            value={assetDetailsStr} 
                                            onChange={handleAssetDetailsChange} 
                                            rows={4} 
                                            className={`json-textarea ${jsonError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[var(--theme-secondary)]'}`} 
                                        />
                                        {jsonError && <p className="text-xs text-red-500 mt-1">{jsonError}</p>}
                                    </div>
                                    <div className="flex items-center">
                                        <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active || false} onChange={e => setFormData(p => ({...p, is_active: e.target.checked}))} className="h-4 w-4 rounded bg-transparent border-[var(--theme-secondary)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-[var(--theme-text)]/90">Item is Active</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="is_approved" name="is_approved" type="checkbox" checked={formData.is_approved || false} onChange={e => setFormData(p => ({...p, is_approved: e.target.checked}))} className="h-4 w-4 rounded bg-transparent border-[var(--theme-secondary)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]" />
                                        <label htmlFor="is_approved" className="ml-2 block text-sm text-[var(--theme-text)]/90">Item is Approved</label>
                                    </div>
                                </div>
                                <div className="p-4 bg-black/20 flex justify-end space-x-3 border-t border-[var(--theme-secondary)]">
                                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto">Cancel</Button>
                                    <Button type="submit" disabled={isSaving} className="w-auto px-6">
                                        {isSaving ? <LoadingSpinner /> : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            {isEditorOpen && (
                <CoverEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    item={formData as StoreItem}
                    onSave={(newAssetDetails) => {
                        setFormData(prev => ({ ...prev, asset_details: newAssetDetails }));
                        setAssetDetailsStr(JSON.stringify(newAssetDetails, null, 2));
                        setIsEditorOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default StoreItemFormModal;