import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import { BackArrowIcon } from '../common/AppIcons';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

interface TopUpPageProps {
    onBack: () => void;
    onPurchase: (productId: number) => void;
    onManageSubscriptions: () => void;
}

// Use a specific type for products to improve performance and type safety
type Product = {
    id: number;
    product_type: "package" | "subscription";
    price: number;
    icon: string | null;
    name: string;
    description: string | null;
    xp_amount: number | null;
};

const TopUpPage: React.FC<TopUpPageProps> = ({ onBack, onPurchase, onManageSubscriptions }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // Select only required fields instead of '*'
            const { data, error } = await supabase
                .from('products')
                .select('id, product_type, price, icon, name, description, xp_amount')
                .eq('is_active', true)
                .order('price', { ascending: true });
            
            if (error) {
                console.error("Failed to fetch products:", error);
            } else {
                setProducts((data as Product[]) || []);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const subscriptionPackages = products.filter(p => p.product_type === 'subscription');
    const xpPackages = products.filter(p => p.product_type === 'package');

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">Top Up XP</h1>
                <div className="w-6"></div> {/* Placeholder */}
            </header>

            {loading ? <div className="flex justify-center pt-20"><LoadingSpinner/></div> : (
                <main className="p-4 space-y-8">
                    {/* Subscriptions Section */}
                    {subscriptionPackages.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Subscription Plans</h2>
                            <div className="space-y-4">
                                {subscriptionPackages.map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', delay: index * 0.15 }}
                                        className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg"
                                    >
                                        <div className="flex items-start">
                                            <div className="text-4xl mr-4">{pkg.icon || '🌟'}</div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-xl">{pkg.name}</h3>
                                                <p className="text-xs text-violet-200 mt-1">{pkg.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">${pkg.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => onPurchase(pkg.id)}
                                            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white focus:ring-white"
                                        >
                                            Subscribe
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                            <Button onClick={onManageSubscriptions} variant="secondary" className="mt-4">
                                My Subscriptions & Daily Claims
                            </Button>
                        </section>
                    )}

                    {/* One-Time Purchase Section */}
                    {xpPackages.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 mb-3">XP Packages</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {xpPackages.map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: 'spring', delay: index * 0.1 }}
                                        className="bg-white p-4 rounded-xl shadow-md text-center flex flex-col justify-between"
                                    >
                                        <div className="text-3xl mb-2">{pkg.icon || '💎'}</div>
                                        <p className="font-bold text-lg text-gray-800">{pkg.xp_amount} XP</p>
                                        <p className="text-sm text-gray-500">${pkg.price.toFixed(2)}</p>
                                        <Button 
                                            size="small"
                                            onClick={() => onPurchase(pkg.id)}
                                            className="mt-3 w-full"
                                        >
                                            Purchase
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            )}
        </div>
    );
};

export default TopUpPage;