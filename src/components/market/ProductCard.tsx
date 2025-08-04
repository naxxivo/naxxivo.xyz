
import React from 'react';
import { Link } from 'react-router-dom';
import { MarketProductWithDetails } from '@/types.ts';
import { motion } from 'framer-motion';
import { supabase } from '@/locales/en/pages/services/supabase.ts';

interface ProductCardProps {
  product: MarketProductWithDetails;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const fallbackImage = 'https://via.placeholder.com/400x400.png?text=No+Image';
  const primaryImagePath = product.market_product_images[0]?.image_path;
  const primaryImage = primaryImagePath 
      ? supabase.storage.from('product_images').getPublicUrl(primaryImagePath).data.publicUrl
      : fallbackImage;

  return (
    <Link to={`/market/product/${product.id}`}>
      <div
        className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg group cursor-pointer overflow-hidden h-full flex flex-col transition-transform duration-200 ease-out hover:-translate-y-2"
      >
        <div className="relative aspect-square w-full overflow-hidden">
            <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute top-2 right-2 bg-accent/80 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                {product.market_categories?.name || 'Category'}
            </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-secondary-purple dark:text-dark-text text-lg truncate flex-grow">{product.title}</h3>
          <div className="mt-2">
            <p className="font-display text-xl text-accent font-bold">
                ${product.price} <span className="text-sm font-sans">{product.currency}</span>
            </p>
            <p className="text-xs text-secondary-purple/70 dark:text-dark-text/70 truncate">{product.location || 'No location'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;