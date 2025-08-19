
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CountdownTimer from '../components/CountdownTimer';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types';

const HomePage: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [flashDealProduct, setFlashDealProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const dealEndDate = new Date();
  dealEndDate.setDate(dealEndDate.getDate() + 3);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch trending products (latest 4)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        if (productsError) throw productsError;

        // Fetch a product for the flash deal (latest product with a discount)
        const { data: dealProductData, error: dealProductError } = await supabase
          .from('products')
          .select('*')
          .not('original_price', 'is', null) // Find products with a discount
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle to prevent error if no deal product found
        if (dealProductError) throw dealProductError;

        setTrendingProducts(productsData || []);
        setFlashDealProduct(dealProductData);

      } catch (error: any) {
         console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[400px] bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/hero/1600/900')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-start text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-tight mb-4 max-w-2xl">
            Timeless Design, <br/> Modern Living.
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl">
            Discover curated pieces that bring beauty and function into your home.
          </p>
          <Link
            to="/shop"
            className="bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-full hover:bg-yellow-600 transition-transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-display text-center mb-10 text-gray-900 dark:text-white">Trending Products</h2>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-accent border border-gray-200 dark:border-slate-800 rounded-lg p-4 animate-pulse">
                        <div className="bg-gray-200 dark:bg-slate-700 h-64 rounded-md"></div>
                        <div className="mt-4 h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="mt-2 h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trendingProducts.map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Flash Deals */}
      {flashDealProduct && (
        <section className="py-20 bg-primary text-white" style={{ backgroundImage: 'linear-gradient(rgba(234, 179, 8, 0.9), rgba(234, 179, 8, 0.9)), url(https://picsum.photos/seed/dealbg/1600/600)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-4xl font-extrabold font-display mb-4">Flash Deal of the Day!</h2>
                <p className="text-lg mb-6">Don't miss out on this exclusive offer. Limited time only.</p>
                <CountdownTimer targetDate={dealEndDate} />
                </div>
                <div className="lg:w-1/2">
                    <div className="bg-white/10 dark:bg-accent rounded-lg p-4 flex gap-4 items-center backdrop-blur-sm">
                        <img src={flashDealProduct.image_url || ''} alt={flashDealProduct.name} className="w-40 h-40 object-cover rounded-md"/>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-white dark:text-text-primary">{flashDealProduct.name}</h3>
                            <div>
                                <span className="text-2xl font-bold text-white">${flashDealProduct.price.toFixed(2)}</span>
                                {flashDealProduct.original_price && <span className="ml-2 text-white/80 dark:text-text-muted line-through">${flashDealProduct.original_price.toFixed(2)}</span>}
                            </div>
                            <Link to={`/product/${flashDealProduct.id}`} className="mt-4 inline-block bg-white text-primary font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition w-full text-center">
                                View Deal
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;