import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { ProductWithCategory } from '../types';
import ProductCard from './ProductCard';
import { useCart } from '../hooks/useCart';

const NaxStoreLogo: React.FC = () => (
  <h1 className="text-2xl font-bold tracking-tighter">
    Nax<span className="text-yellow-400">Store</span>
  </h1>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const AdminIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


interface HeaderProps {
    onNavigateToProfile: () => void;
    onNavigateToAdmin: () => void;
    onNavigateToCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToProfile, onNavigateToAdmin, onNavigateToCart }) => {
    const { user, profile, signOut } = useAuth();
    const { cartItems } = useCart();
    
    const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <NaxStoreLogo />
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {profile?.is_admin && (
                             <button onClick={onNavigateToAdmin} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium" aria-label="Admin Panel">
                                <AdminIcon />
                                <span className="hidden md:block">Admin</span>
                            </button>
                        )}
                        <button onClick={onNavigateToCart} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600" aria-label="Shopping Cart">
                            <CartIcon />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                        <button onClick={onNavigateToProfile} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[120px] truncate" title={user?.email}>{user?.email}</span>
                            <UserIcon />
                        </button>
                        <button onClick={signOut} className="text-gray-500 hover:text-yellow-500 transition-colors p-2 rounded-lg hover:bg-gray-100" aria-label="Logout">
                            <LogoutIcon />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const ProductGridSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse mb-3"></div>
                    <div className="h-7 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
        ))}
    </div>
);

const fetchProducts = async (): Promise<ProductWithCategory[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to load products. Please try again later.');
    }
    return data as ProductWithCategory[];
};


interface HomeProps {
    onNavigateToProfile: () => void;
    onNavigateToAdmin: () => void;
    onNavigateToCart: () => void;
    onNavigateToCheckout: (productId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToProfile, onNavigateToAdmin, onNavigateToCart, onNavigateToCheckout }) => {
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const renderProductGrid = () => {
        if (isLoading) {
            return <ProductGridSkeleton />;
        }

        if (error) {
            return <p className="text-center text-red-500">{error.message}</p>;
        }

        if (!products || products.length === 0) {
            return <p className="text-center text-gray-500">No products found.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} onNavigateToCheckout={onNavigateToCheckout} />
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <Header onNavigateToProfile={onNavigateToProfile} onNavigateToAdmin={onNavigateToAdmin} onNavigateToCart={onNavigateToCart} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">New Arrivals</h2>
                {renderProductGrid()}
            </main>
        </div>
    );
};

export default Home;