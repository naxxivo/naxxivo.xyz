import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types';

const ProductListingPage: React.FC = () => {
    const location = useLocation();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [priceRange, setPriceRange] = useState<number>(1000);
    const [sortOrder, setSortOrder] = useState<string>('latest');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchFromQuery = queryParams.get('q');
        setSearchQuery(searchFromQuery || '');
    }, [location.search]);


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            let query = supabase.from('products').select('*');

            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }
            
            query = query.lte('price', priceRange);

            switch (sortOrder) {
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'latest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } else {
                setProducts(data as Product[] || []);
            }
            setLoading(false);
        };
        fetchProducts();
    }, [priceRange, sortOrder, searchQuery]);

    const clearFilters = () => {
        setPriceRange(1000);
        setSearchQuery('');
    }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Panel */}
        <aside className="lg:w-1/4">
          <div className="sticky top-24 space-y-8 bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold text-xl mb-4">Price Range</h3>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-center mt-2 text-gray-500 dark:text-text-muted">Up to ${priceRange}</div>
            </div>

            <button onClick={clearFilters} className="w-full py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-text-primary rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition">Clear Filters</button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">{searchQuery ? `Results for "${searchQuery}"` : "Shop"}</h1>
                <div className="relative">
                    <select 
                        className="appearance-none bg-white dark:bg-accent border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-text-primary rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                    >
                        <option value="latest">Latest</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-text-muted absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
          
            {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-accent border border-gray-200 dark:border-slate-800 rounded-lg p-4 animate-pulse">
                            <div className="bg-gray-200 dark:bg-slate-700 h-64 rounded-md"></div>
                            <div className="mt-4 h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="mt-2 h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ))}
                 </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-text-muted text-lg">No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;