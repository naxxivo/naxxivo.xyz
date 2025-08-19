import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Product } from '../../types';
import ProductForm from '../../components/admin/ProductForm';
import AddProductFromUrlModal from '../../components/admin/AddProductFromUrlModal';

const ProductListPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching products:", error.message);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };
    
    const handleAddNewFromUrl = () => {
        setIsUrlModalOpen(true);
    };

    const handleUrlDataFetched = (data: Partial<Product>) => {
        setIsUrlModalOpen(false);
        setEditingProduct(data as Product);
        setIsFormOpen(true);
    };

    const handleDelete = async (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                alert('Error deleting product: ' + error.message);
            } else {
                fetchProducts();
            }
        }
    };
    
    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchProducts();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-display">Products</h1>
                <div className="flex space-x-2">
                    <button onClick={handleAddNewFromUrl} className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition">
                        Add from URL
                    </button>
                    <button onClick={handleAddNew} className="bg-primary text-background dark:text-white font-semibold py-2 px-4 rounded-md hover:bg-yellow-600 transition">
                        Add New Product
                    </button>
                </div>
            </div>
            
            {isUrlModalOpen && (
                <AddProductFromUrlModal
                    onClose={() => setIsUrlModalOpen(false)}
                    onDataFetched={handleUrlDataFetched}
                />
            )}

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                     <ProductForm 
                        product={editingProduct} 
                        onSuccess={handleFormSuccess}
                        onClose={() => setIsFormOpen(false)}
                    />
                </div>
            )}

            <div className="bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                {loading ? <p>Loading products...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-text-muted">
                            <thead className="text-xs text-gray-700 dark:text-text-primary uppercase bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3">Stock Status</th>
                                    <th scope="col" className="px-6 py-3">Source</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="bg-white dark:bg-accent border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-text-primary">{product.name}</td>
                                        <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{product.stock_status}</td>
                                        <td className="px-6 py-4">
                                            {product.is_external ? (
                                                <a href={product.source_url || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    External Link
                                                </a>
                                            ) : (
                                                'Internal'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex space-x-2">
                                            <button onClick={() => handleEdit(product)} className="font-medium text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;