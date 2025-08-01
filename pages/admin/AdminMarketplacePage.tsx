


import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { MarketProductWithDetails } from '../../types';
import { AnimeLoader } from '../../components/ui/Loader';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/solid';

const AdminMarketplacePage: React.FC = () => {
    const [products, setProducts] = useState<MarketProductWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            let query = supabase.from('market_products').select(`
                id, user_id, category_id, title, description, price, currency, location, condition, status, created_at,
                profiles (name, username),
                market_categories (name),
                market_product_images (image_path)
            `);

            if (searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }
            
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) {
                setError('Failed to fetch products.');
                console.error(error);
            } else {
                setProducts(data as any[] || []);
            }
            setLoading(false);
        };
        
        const debounceTimer = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm(`Are you sure you want to delete this product? This action cannot be undone.`)) {
            const { error } = await supabase.from('market_products').delete().eq('id', productId);
            if (error) {
                alert(`Failed to delete product: ${error.message}`);
            } else {
                alert('Product deleted successfully.');
                setProducts(products.filter(p => p.id !== productId));
            }
        }
    };
    
    const getImageUrl = (path: string | undefined) => {
      if (!path) return 'https://via.placeholder.com/150';
      return supabase.storage.from('product_images').getPublicUrl(path).data.publicUrl;
    }

    return (
        <div>
            <h1 className="text-4xl font-display font-bold mb-8">Marketplace Management</h1>
            <div className="mb-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
                 <div className="relative flex-grow w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by product title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none"
                    />
                </div>
            </div>

            {loading ? <AnimeLoader /> : error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Seller</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={getImageUrl(product.market_product_images[0]?.image_path)} className="w-12 h-12 object-cover rounded-md" />
                                            <Link to={`/market/product/${product.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:underline max-w-xs truncate">{product.title}</Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/profile/${product.user_id}`} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                                            {product.profiles?.name || product.profiles?.username}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {products.length === 0 && <p className="text-center py-10">No products found.</p>}
                </div>
            )}
        </div>
    );
};

export default AdminMarketplacePage;