import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Product } from '../../types';
import { TablesInsert, TablesUpdate } from '../../integrations/supabase/types';

interface ProductFormProps {
    product: Partial<Product> | null;
    onSuccess: () => void;
    onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0 as number | string,
        original_price: null as number | string | null,
        image_url: '',
        stock_status: 'In Stock',
        source_url: '',
        is_external: false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || 0,
                original_price: product.original_price || null,
                image_url: product.image_url || '',
                stock_status: product.stock_status || 'In Stock',
                source_url: product.source_url || '',
                is_external: product.is_external || false,
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Sanitize data before submission to prevent errors
        const priceAsNumber = parseFloat(String(formData.price));
        const originalPriceAsNumber = formData.original_price ? parseFloat(String(formData.original_price)) : null;

        const submissionData = {
            ...formData,
            price: isNaN(priceAsNumber) ? 0 : priceAsNumber,
            original_price: originalPriceAsNumber && !isNaN(originalPriceAsNumber) ? originalPriceAsNumber : null,
        };

        const { error } = product && product.id
            ? await supabase.from('products').update(submissionData).eq('id', product.id)
            : await supabase.from('products').insert([submissionData]);

        if (error) {
            alert('Error saving product: ' + error.message);
        } else {
            onSuccess();
        }
        setLoading(false);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="bg-white dark:bg-accent rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                 <h2 className="text-2xl font-bold font-display">{product && product.id ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={inputClasses} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Price</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Original Price (optional)</label>
                        <input type="number" step="0.01" name="original_price" value={formData.original_price || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Image URL</label>
                    <input type="text" name="image_url" value={formData.image_url || ''} onChange={handleChange} className={inputClasses} />
                </div>
                {formData.is_external && (
                    <div>
                        <label className="block text-sm font-medium text-emerald-500 dark:text-emerald-300">Source URL</label>
                        <input type="text" name="source_url" value={formData.source_url} onChange={handleChange} className={`${inputClasses} bg-emerald-50 dark:bg-emerald-900/50`} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Stock Status</label>
                        <select name="stock_status" value={formData.stock_status} onChange={handleChange} className={inputClasses}>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-text-primary font-semibold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="bg-primary text-background dark:text-white font-semibold py-2 px-6 rounded-md hover:bg-yellow-600 transition disabled:bg-primary/50">
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;