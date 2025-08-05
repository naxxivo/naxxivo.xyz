



import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarketProductWithDetails, MarketCategory } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ProductCard from '../components/market/ProductCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  }
};

const MarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MarketProductWithDetails[]>([]);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering and Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('created_at.desc');

  const filters = useMemo(() => ({
      searchTerm, filterCategory, priceRange, sortBy
  }), [searchTerm, filterCategory, priceRange, sortBy]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('market_categories')
          .select('id, name, created_at')
          .order('name', { ascending: true });
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData as unknown as MarketCategory[] || []);

        let query = supabase
          .from('market_products')
          .select(`
            id, user_id, category_id, title, description, price, currency, location, condition, status, created_at,
            market_categories (name),
            profiles (id, name, photo_url, username),
            market_product_images (image_path)
          `)
          .eq('status', 'available');

        if (filters.searchTerm) {
          query = query.ilike('title', `%${filters.searchTerm}%`);
        }
        if (filters.filterCategory) {
          query = query.eq('category_id', filters.filterCategory);
        }
        if (filters.priceRange.min) {
            query = query.gte('price', Number(filters.priceRange.min));
        }
        if (filters.priceRange.max) {
            query = query.lte('price', Number(filters.priceRange.max));
        }

        const [sortField, sortOrder] = filters.sortBy.split('.');
        query = query.order(sortField, { ascending: sortOrder === 'asc' });

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
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

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

      <div className="mb-8 p-4 bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg rounded-xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
            >
                <option value="created_at.desc">Sort: Newest</option>
                <option value="price.asc">Sort: Price Low-High</option>
                <option value="price.desc">Sort: Price High-Low</option>
            </select>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner"
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <div className="flex-grow w-full flex items-center gap-2">
                <input type="number" placeholder="Min Price" value={priceRange.min} onChange={(e) => setPriceRange(p => ({...p, min: e.target.value}))} className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner" />
                <span>-</span>
                <input type="number" placeholder="Max Price" value={priceRange.max} onChange={(e) => setPriceRange(p => ({...p, max: e.target.value}))} className="w-full px-4 py-2 bg-white/50 dark:bg-dark-bg/50 border-2 border-primary-blue/20 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-inner" />
            </div>
        </div>
      </div>

      {loading && <AnimeLoader />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={itemVariants}>
              <ProductCard product={p} />
            </motion.div>
          ))}
          {products.length === 0 && <p className="text-center col-span-full py-10">No products found. Try adjusting your search or be the first to list something!</p>}
        </motion.div>
      )}
    </PageTransition>
  );
};

export default MarketplacePage;
