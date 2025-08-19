
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Rating from '../components/Rating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, TruckIcon, ArrowUturnLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { wishlistProductIds, addToWishlist, removeFromWishlist } = useWishlist();

  const isWishlisted = product ? wishlistProductIds.has(product.id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product:', error.message);
        setProduct(null);
      } else {
        setProduct(data as Product | null);
        if(data) {
          const variants = data.variants as { colors?: { name: string; hex: string }[], sizes?: string[] } | null;
          const imageUrls = [data.image_url, ...(data.gallery_urls || [])].filter(Boolean) as string[];
          setActiveImage(imageUrls[0] || null);
          setSelectedColor(variants?.colors?.[0]?.name);
          setSelectedSize(variants?.sizes?.[0]);
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      addToCart(product, quantity, selectedColor, selectedSize);
    }
  };
  
  const handleWishlistToggle = () => {
      if (!product) return;
      if (!isAuthenticated) {
          alert('Please log in to manage your wishlist.');
          navigate('/login');
          return;
      }
      if (isWishlisted) {
          removeFromWishlist(product.id);
      } else {
          addToWishlist(product.id);
      }
  };

  if (loading) {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
                  <div>
                      <div className="w-full h-[500px] bg-gray-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                      <div className="flex space-x-4">
                          <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                          <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                          <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
                      <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                      <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                  </div>
              </div>
          </div>
      )
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }
  
  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean) as string[];
  const variants = product.variants as { colors?: { name: string; hex: string }[], sizes?: string[] } | null;
  const details = product.details as { material?: string, dimensions?: string, origin?: string } | null;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Gallery */}
        <div>
          <div className="w-full h-[500px] bg-gray-100 dark:bg-accent rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            <img src={activeImage || ''} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex space-x-4">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`w-24 h-24 rounded-md cursor-pointer overflow-hidden border-2 ${
                  activeImage === img ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-text-primary mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
          
          {/* Variants */}
          <div className="space-y-6">
            {variants?.colors && (
              <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-text-muted mb-2">Color</h3>
                  <div className="flex space-x-2">
                      {variants.colors.map(color => (
                          <button key={color.name} onClick={() => setSelectedColor(color.name)}
                              className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.name ? 'border-primary' : 'border-transparent'}`}
                              aria-label={`Select color ${color.name}`}
                          >
                              <span className="block w-full h-full rounded-full border-2 border-white dark:border-background" style={{ backgroundColor: color.hex }}></span>
                          </button>
                      ))}
                  </div>
              </div>
            )}
             {variants?.sizes && (
              <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-text-muted mb-2">Size</h3>
                  <div className="flex space-x-2">
                      {variants.sizes.map(size => (
                          <button key={size} onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 border rounded-md text-sm transition ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-accent border-gray-300 dark:border-slate-700 text-gray-900 dark:text-text-primary'}`}
                          >
                              {size}
                          </button>
                      ))}
                  </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-md">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-text-muted">-</button>
              <span className="px-4 py-2">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-text-muted">+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 bg-primary text-background dark:text-white font-semibold py-3 px-6 rounded-md hover:bg-yellow-600 transition">
              Add to Cart
            </button>
             <button onClick={handleWishlistToggle} className="p-3 border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-accent transition">
                <HeartIcon className={`w-6 h-6 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-text-muted'}`} />
            </button>
          </div>
           {/* Trust Badges */}
           <div className="mt-8 flex justify-between border-t border-b border-gray-200 dark:border-slate-800 py-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-text-muted">
                    <TruckIcon className="w-6 h-6 text-primary"/>
                    <span>Fast Delivery</span>
                </div>
                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-text-muted">
                    <ArrowUturnLeftIcon className="w-6 h-6 text-primary"/>
                    <span>Easy Returns</span>
                </div>
                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-text-muted">
                    <ShieldCheckIcon className="w-6 h-6 text-primary"/>
                    <span>Secure Payment</span>
                </div>
           </div>
        </div>
      </div>
      
      {/* Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200 dark:border-slate-800">
          <nav className="flex space-x-8">
            <button onClick={() => setActiveTab('description')} className={`py-4 px-1 font-semibold border-b-2 ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-text-muted hover:text-gray-800 dark:hover:text-text-primary'}`}>Description</button>
            <button onClick={() => setActiveTab('details')} className={`py-4 px-1 font-semibold border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-text-muted hover:text-gray-800 dark:hover:text-text-primary'}`}>Details</button>
            <button onClick={() => setActiveTab('reviews')} className={`py-4 px-1 font-semibold border-b-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-text-muted hover:text-gray-800 dark:hover:text-text-primary'}`}>Reviews</button>
          </nav>
        </div>
        <div className="py-8 prose max-w-none text-gray-600 dark:text-text-muted">
            {activeTab === 'description' && <p>{product.description}</p>}
            {activeTab === 'details' && details && (
                <ul className="list-disc pl-5">
                    {details.material && <li>Material: {details.material}</li>}
                    {details.dimensions && <li>Dimensions: {details.dimensions}</li>}
                    {details.origin && <li>Origin: {details.origin}</li>}
                </ul>
            )}
            {activeTab === 'reviews' && <p>Reviews are coming soon!</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;