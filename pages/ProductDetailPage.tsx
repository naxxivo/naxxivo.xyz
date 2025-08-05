
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarketProductWithDetails } from '../types';
import { useAuth } from '../App';
import PageTransition from '../components/ui/PageTransition';
import { AnimeLoader } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ImageCarousel from '../components/market/ImageCarousel';
import { MapPinIcon, TagIcon, SparklesIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MarketProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('market_products')
        .select(`
            *,
            market_categories (name),
            profiles (id, name, photo_url, username),
            market_product_images (id, image_url)
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product details:', error);
        setError('Could not find this product.');
      } else {
        setProduct(data as unknown as MarketProductWithDetails);
      }
      setLoading(false);
    };

    fetchProductDetails();
  }, [productId]);

  const handleMessageSeller = () => {
    if (!product || !product.profiles) return;
    navigate(`/messages/${product.profiles.id}`);
  };

  if (loading) return <AnimeLoader />;
  if (error || !product) return <p className="text-center text-red-500 py-10">{error || 'Product not found.'}</p>;

  const seller = product.profiles;
  const isOwner = user?.id === seller?.id;
  const defaultAvatar = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${seller?.username || 'default'}`;

  return (
    <PageTransition>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side - Image Carousel */}
        <div className="lg:col-span-3">
          <ImageCarousel images={product.market_product_images.map(img => img.image_url)} />
        </div>

        {/* Right Side - Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
            <span className="inline-block bg-accent/20 text-accent font-bold text-xs px-3 py-1 rounded-full mb-2">{product.market_categories?.name}</span>
            <h1 className="font-display text-4xl font-bold">{product.title}</h1>
            <p className="font-display text-3xl text-accent font-bold my-4">${product.price}</p>
            <p className="text-secondary-purple/90 dark:text-dark-text/90 whitespace-pre-wrap">{product.description}</p>
            
            <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-primary-blue"/><strong>Condition:</strong> {product.condition || 'N/A'}</div>
                <div className="flex items-center gap-3"><MapPinIcon className="w-5 h-5 text-primary-blue"/><strong>Location:</strong> {product.location || 'N/A'}</div>
            </div>
          </div>

          {seller && (
             <div className="bg-white/60 dark:bg-dark-card/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
                <h2 className="font-bold text-xl mb-4">Seller Information</h2>
                <div className="flex items-center space-x-4">
                    <Link to={`/profile/${seller.id}`}>
                        <img src={seller.photo_url || defaultAvatar} alt={seller.name || ''} className="w-16 h-16 rounded-full border-2 border-accent object-cover"/>
                    </Link>
                    <div>
                        <Link to={`/profile/${seller.id}`} className="font-bold hover:underline">{seller.name || seller.username}</Link>
                        <p className="text-sm text-secondary-purple/70 dark:text-dark-text/70">@{seller.username}</p>
                    </div>
                </div>
                 {!isOwner && user && (
                    <Button 
                        text="Message Seller"
                        onClick={handleMessageSeller} 
                        className="w-full mt-4 !flex items-center justify-center gap-2"
                    >
                        <EnvelopeIcon className="w-5 h-5"/>
                    </Button>
                )}
             </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetailPage;
