
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { EyeIcon } from './icons/EyeIcon';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { wishlistProductIds, addToWishlist, removeFromWishlist } = useWishlist();

    const isWishlisted = wishlistProductIds.has(product.id);

    const handleAddToCart = () => {
        // Provide default values if variants are not available
        const variants = product.variants as { colors?: { name: string; hex: string }[], sizes?: string[] } | null;
        const defaultColor = variants?.colors?.[0]?.name || 'Default';
        const defaultSize = variants?.sizes?.[0] || 'One Size';
        addToCart(product, 1, defaultColor, defaultSize);
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
          alert('Please log in to add items to your wishlist.');
          return;
      }
      if (isWishlisted) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product.id);
      }
    };

  return (
    <div className="group relative bg-white dark:bg-accent border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <div className="overflow-hidden">
          <img
            src={product.image_url || 'https://picsum.photos/seed/placeholder/600/600'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-text-primary truncate">
          <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-500 dark:text-text-muted line-through ml-2">${product.original_price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
      
       <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={handleWishlistToggle} className="bg-white dark:bg-slate-900 p-2.5 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-slate-800 transition" aria-label="Toggle Wishlist">
              {isWishlisted ? <HeartSolid className="w-5 h-5 text-red-500"/> : <HeartOutline className="w-5 h-5 text-gray-500 dark:text-text-muted"/>}
          </button>
          <Link to={`/product/${product.id}`} className="bg-white dark:bg-slate-900 p-2.5 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <EyeIcon className="w-5 h-5 text-gray-500 dark:text-text-muted"/>
          </Link>
          <button onClick={handleAddToCart} className="bg-white dark:bg-slate-900 p-2.5 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-slate-800 transition" aria-label="Add to cart quick view">
            <ShoppingCartIcon className="w-5 h-5 text-gray-500 dark:text-text-muted"/>
          </button>
      </div>
      <button onClick={handleAddToCart} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 bg-primary text-background dark:text-white font-semibold py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-yellow-600">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;