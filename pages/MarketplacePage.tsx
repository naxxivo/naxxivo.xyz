
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarketProductWithDetails, MarketCategory } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ProductCard from '../components/market/ProductCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const MarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MarketProductWithDetails[]>([]);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('market_categories')
          .select('*')
          .order('name', { ascending: true });
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData as MarketCategory[] || []);

        // Fetch Products
        let query = supabase
          .from('market_products')
          .select(`
            *,
            market_categories (name),
            profiles (name, photo_url, username),
            market_product_images (image_url)
          `)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }
        if (filterCategory) {
          query = query.eq('category_id', filterCategory);
        }

        const { data: productsData, error: productsError } = await query;
        if (productsError) throw productsError;
        setProducts(productsData as unknown as MarketProductWithDetails[] || []);

      } catch (err: any) {
        console.error('Error fetching marketplace data:', err);
        setError('Could not load the marketplace. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
        fetchData();
    }, 300); // Debounce search input

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterCategory]);

  return (
    <PageTransition>
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
          Marketplace
        </h1>
        <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
          Discover amazing items from the community.
        </p>
        {user && (
          <div className="mt-6">
            <Link to="/market/new">
              <Button text="List an Item" />
            </Link>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && <p className="text-center col-span-full py-10">No products found. Try adjusting your search or be the first to list something!</p>}
        </div>
      )}
    </PageTransition>
  );
};

export default MarketplacePage;
