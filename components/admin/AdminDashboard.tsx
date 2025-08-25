import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Product, Category } from '../../types';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

interface AdminDashboardProps {
    onNavigateHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (productsError) throw productsError;
            setProducts(productsData || []);

            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            
            if (categoriesError) throw categoriesError;
            setCategories(categoriesData || []);

        } catch (err: any) {
            console.error('Error fetching admin data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        fetchData(); // Refresh data after save
    };
    
    const handleDelete = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product.');
            } else {
                fetchData();
            }
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
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
                
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
                    {loading ? (
                        <p>Loading products...</p>
                    ) : (
                        <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />
                    )}
                </div>
            </main>

            {isFormOpen && (
                <ProductForm 
                    product={editingProduct} 
                    categories={categories}
                    onClose={handleCloseForm} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

export default AdminDashboard;
