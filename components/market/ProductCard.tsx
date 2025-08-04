
import React from 'react';
import { Link } from 'react-router-dom';
import { MarketProductWithDetails } from '@/types';
import { motion } from 'framer-motion';
import { supabase } from '@/locales/en/pages/services/supabase';

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
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm rounded-2xl shadow-lg group cursor-pointer overflow-hidden h-full flex flex-col"
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
      </motion.div>
    </Link>
  );
};

export default ProductCard;
