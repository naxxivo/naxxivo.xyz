import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import type { Product, Category } from '../../types';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

interface AdminDashboardProps {
    onNavigateHome: () => void;
}

const fetchAdminData = async () => {
    const productsPromise = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    const categoriesPromise = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
    
    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([productsPromise, categoriesPromise]);

    if (productsError) throw productsError;
    if (categoriesError) throw categoriesError;

    return { products: products || [], categories: categories || [] };
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
    const queryClient = useQueryClient();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['adminData'],
        queryFn: fetchAdminData,
    });
    
    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminData'] });
        },
        onError: (err: any) => {
            console.error('Error deleting product:', err);
            alert('Failed to delete product.');
        }
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCreateNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleSave = () => {
        handleCloseForm();
        queryClient.invalidateQueries({ queryKey: ['adminData'] });
        queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate public products too
    };
    
    const handleDelete = (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(productId);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <button onClick={onNavigateHome} className="text-sm font-medium text-yellow-600 hover:text-yellow-800">
                        &larr; Back to Store
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error.message}</p>}
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Manage Products</h2>
                        <button 
                            onClick={handleCreateNew}
                            className="bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-colors"
                        >
                            + Add New Product
                        </button>
                    </div>
                    {isLoading ? (
                        <p>Loading products...</p>
                    ) : (
                        <ProductList products={data?.products || []} onEdit={handleEdit} onDelete={handleDelete} />
                    )}
                </div>
            </main>

            {isFormOpen && (
                <ProductForm 
                    product={editingProduct} 
                    categories={data?.categories || []}
                    onClose={handleCloseForm} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

export default AdminDashboard;