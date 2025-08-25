import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Product, Category } from '../../types';

interface ProductFormProps {
    product: Product | null;
    categories: Category[];
    onClose: () => void;
    onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        stock_quantity: product?.stock_quantity || 0,
        category_id: product?.category_id || '',
        is_active: product?.is_active ?? true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let imageUrl = product?.image_url;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `product-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);

                if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
                
                const { data } = supabase.storage.from('products').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const payload = { 
                ...formData,
                price: Number(formData.price),
                stock_quantity: Number(formData.stock_quantity),
                image_url: imageUrl 
            };

            if (product) {
                // Update existing product
                const { error } = await supabase.from('products').update(payload).eq('id', product.id);
                if (error) throw error;
            } else {
                // Create new product
                const { error } = await supabase.from('products').insert(payload);
                if (error) throw error;
            }

            onSave();

        } catch (err: any) {
            console.error('Error saving product:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {error && <p className="md:col-span-2 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                        
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">Product Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="w-full input"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full input"></textarea>
                        </div>
                        <div>
                            <label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-2">Price</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full input"/>
                        </div>
                        <div>
                            <label htmlFor="stock_quantity" className="text-sm font-medium text-gray-700 block mb-2">Stock Quantity</label>
                            <input type="number" name="stock_quantity" id="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required min="0" className="w-full input"/>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="category_id" className="text-sm font-medium text-gray-700 block mb-2">Category</label>
                             <select name="category_id" id="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full input">
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                             </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Product Image</label>
                            <div className="flex items-center gap-4">
                               {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover bg-gray-100" />}
                               <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
                            </div>
                        </div>
                         <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Product is Active</label>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-lg text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-500 transition disabled:opacity-50 flex items-center">
                            {isLoading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {product ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.input { box-shadow: none !important; border-color: #d1d5db; border-radius: 0.5rem; padding: 0.5rem 1rem; transition: border-color 0.2s, box-shadow 0.2s; } .input:focus { border-color: #f59e0b; --tw-ring-color: #f59e0b; box-shadow: 0 0 0 2px var(--tw-ring-color) !important;}`}</style>
        </div>
    );
};

export default ProductForm;