import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tables, Enums } from '../../integrations/supabase/types';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

type Product = Tables<'products'>;

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Partial<Product>) => void;
    productToEdit: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        product_type: 'package',
        xp_amount: 0,
        subscription_initial_xp: 0,
        subscription_daily_xp: 0,
        subscription_duration_days: 0,
        is_active: true,
        icon: '💎'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setFormData(productToEdit);
        } else {
            // Reset to default for new product
            setFormData({
                name: '', description: '', price: 0, product_type: 'package',
                xp_amount: 0, subscription_initial_xp: 0, subscription_daily_xp: 0,
                subscription_duration_days: 0, is_active: true, icon: '💎'
            });
        }
    }, [productToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleToggle = (name: keyof Product, value: boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
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
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold dark:text-gray-200">{productToEdit ? 'Edit Product' : 'Create New Product'}</h2>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <Input id="name" label="Product Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input id="price" label="Price ($)" name="price" type="number" step="0.01" value={formData.price || ''} onChange={handleChange} required />
                                    <Input id="icon" label="Icon (Emoji)" name="icon" value={formData.icon || ''} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Type</label>
                                    <select name="product_type" value={formData.product_type} onChange={handleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                        <option value="package">Package</option>
                                        <option value="subscription">Subscription</option>
                                    </select>
                                </div>
                                
                                {formData.product_type === 'package' ? (
                                    <Input id="xp_amount" label="XP Amount" name="xp_amount" type="number" value={formData.xp_amount || ''} onChange={handleChange} />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md space-y-3">
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Subscription Details</h4>
                                        <Input id="subscription_initial_xp" label="Initial XP on Purchase" name="subscription_initial_xp" type="number" value={formData.subscription_initial_xp || ''} onChange={handleChange} />
                                        <Input id="subscription_daily_xp" label="Daily XP Claim" name="subscription_daily_xp" type="number" value={formData.subscription_daily_xp || ''} onChange={handleChange} />
                                        <Input id="subscription_duration_days" label="Duration (days)" name="subscription_duration_days" type="number" value={formData.subscription_duration_days || ''} onChange={handleChange} />
                                    </div>
                                )}
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                     <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Product is Active</label>
                                     <button type="button" onClick={() => handleToggle('is_active', !formData.is_active)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${formData.is_active ? 'bg-violet-600' : 'bg-gray-300'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto">Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="w-auto">
                                    {isSaving ? <LoadingSpinner /> : 'Save Product'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductFormModal;