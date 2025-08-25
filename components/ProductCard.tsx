import React from 'react';
import type { ProductWithCategory } from '../types';

interface ProductCardProps {
  product: ProductWithCategory;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const fallbackImage = `https://picsum.photos/seed/${product.id}/400/400`;

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative">
        <img 
          className="w-full h-56 object-cover" 
          src={product.image_url || fallbackImage} 
          alt={product.name}
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <button className="w-full bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                Add to Cart
             </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-yellow-600">{product.categories?.name || 'Uncategorized'}</p>
        <h3 className="text-lg font-semibold text-gray-800 mt-1 truncate">{product.name}</h3>
        <p className="text-xl font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
