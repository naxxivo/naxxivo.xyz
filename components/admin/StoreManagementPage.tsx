import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, TablesInsert, TablesUpdate } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import ProductFormModal from './ProductFormModal';

type Product = Tables<'products'>;

interface StoreManagementPageProps {
    session: Session;
}

const StoreManagementPage: React.FC<StoreManagementPageProps> = ({ session }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at');
        if (error) {
            console.error("Failed to fetch products:", error);
            alert(`Error: ${error.message}`);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreateNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            const payload = {
                ...productData,
                price: Number(productData.price) || 0,
                xp_amount: Number(productData.xp_amount) || null,
                subscription_initial_xp: Number(productData.subscription_initial_xp) || null,
                subscription_daily_xp: Number(productData.subscription_daily_xp) || null,
                subscription_duration_days: Number(productData.subscription_duration_days) || null,
            };
            
            // `upsert` handles both creating (if id is missing) and updating
            const { error } = await supabase.from('products').upsert(payload).select();
            
            if (error) throw error;
            
            setIsModalOpen(false);
            await fetchProducts(); // Refresh the list
        } catch (err: any) {
             console.error('Failed to save product:', err);
             alert(`Save failed: ${err.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-gray-200">Store Products</h2>
                <button 
                    onClick={handleCreateNew}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Create New Product
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">XP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{product.product_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {product.product_type === 'package' ? product.xp_amount : 
                                         `${product.subscription_initial_xp || 0} + ${product.subscription_daily_xp || 0}/day`
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <ProductFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                    productToEdit={editingProduct}
                />
            )}
        </div>
    );
};

export default StoreManagementPage;