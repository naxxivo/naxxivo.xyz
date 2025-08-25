import React, { useState } from 'react';
import type { ProductWithCategory } from '../types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: ProductWithCategory;
  index: number;
  onNavigateToCheckout: (productId: string) => void;
  onNavigateToDetail: (productId: string) => void;
}

const HeartIcon: React.FC<{ isWishlisted: boolean }> = ({ isWishlisted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onNavigateToCheckout, onNavigateToDetail }) => {
  const fallbackImage = `https://picsum.photos/seed/${product.id}/400/400`;
  const { addToCartMutation, isItemInCart } = useCart();
  const { wishlist, addMutation, removeMutation } = useWishlist();
  const { session } = useAuth();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = wishlist?.some(item => item.product_id === product.id) ?? false;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;
    if (isWishlisted) {
      removeMutation.mutate(product.id);
    } else {
      addMutation.mutate(product.id);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate(product.id, {
      onSuccess: () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    });
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToCheckout(product.id);
  }

  const alreadyInCart = isItemInCart(product.id);
  
  const renderButtonContent = () => {
    if (addToCartMutation.isPending) {
      return <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>;
    }
    if (justAdded) {
      return <span className="flex items-center gap-2"><CheckIcon /> Added!</span>;
    }
    if (alreadyInCart) {
      return 'In Cart';
    }
    return 'Add to Cart';
  };

  return (
    <div
      onClick={() => onNavigateToDetail(product.id)}
      className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 opacity-0 animate-fade-in-up flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden">
        <img 
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
          src={product.image_url || fallbackImage} 
          alt={product.name}
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute top-3 right-3">
           <button 
             onClick={handleToggleWishlist}
             disabled={addMutation.isPending || removeMutation.isPending}
             className="bg-white/80 backdrop-blur-sm rounded-full p-2 transition-transform hover:scale-110 disabled:opacity-50 shadow"
             aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
           >
             <HeartIcon isWishlisted={isWishlisted} />
           </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm font-medium text-yellow-600 flex-shrink-0">{product.categories?.name || 'Uncategorized'}</p>
        <h3 className="text-lg font-semibold text-gray-800 mt-1 truncate flex-shrink-0">{product.name}</h3>
        <div className="flex-grow"></div>
        <div className="mt-4 flex flex-col gap-2 flex-shrink-0">
            <p className="text-xl font-bold text-gray-900 text-left">${product.price.toFixed(2)}</p>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || justAdded || alreadyInCart}
                    className={`text-sm font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center
                    ${justAdded ? 'bg-green-500 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}
                    disabled:bg-gray-300 disabled:text-gray-500
                    `}
                >
                    {renderButtonContent()}
                </button>
                <button 
                    onClick={handleBuyNow}
                    className="text-sm font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-300 bg-yellow-400 text-black hover:bg-yellow-500"
                >
                    Buy Now
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;