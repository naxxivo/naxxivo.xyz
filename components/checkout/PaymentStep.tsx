import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCheckout } from '../../context/CheckoutContext';
import { supabase } from '../../integrations/supabase/client';
import { Json } from '../../integrations/supabase/types';

interface PaymentStepProps {
    onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onBack }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { checkoutState, resetCheckout } = useCheckout();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shippingCost = checkoutState.deliveryMethod?.cost || 0;
    const finalTotal = cartTotal + shippingCost;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || cartItems.length === 0) {
            setError("You must be logged in and have items in your cart.");
            return;
        }
        if (!checkoutState.shippingAddress) {
            setError("Shipping address is missing.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Create the order in the 'orders' table
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    total_amount: finalTotal,
                    status: 'Processing',
                    payment_status: 'Paid',
                    shipping_address: checkoutState.shippingAddress as unknown as Json,
                }])
                .select()
                .single();

            if (orderError) throw orderError;
            if (!orderData) throw new Error("Order creation failed, no data returned.");
            
            // Step 2: Create the order items
            const orderItems = cartItems.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price,
                selected_variant: { 
                    color: item.selectedColor,
                    size: item.selectedSize
                } as unknown as Json
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Step 3: Clear the cart, reset checkout state, and navigate
            clearCart();
            resetCheckout();
            navigate('/order-success');

        } catch (err: any) {
            console.error("Checkout error:", err);
            setError(err.message || 'An unexpected error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Payment</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300 px-4 py-3 rounded-md mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <form onSubmit={handlePayment} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Card Number</label>
                    <input type="text" placeholder="•••• •••• •••• 4242" className={inputClasses} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Expiry Date</label>
                        <input type="text" placeholder="MM / YY" className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">CVC</label>
                        <input type="text" placeholder="•••" className={inputClasses} required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Name on Card</label>
                    <input type="text" className={inputClasses} required />
                </div>
                <div className="pt-6 flex justify-between items-center">
                    <button type="button" onClick={onBack} className="text-sm font-medium text-gray-600 dark:text-text-muted hover:text-primary">
                        &larr; Back to Delivery
                    </button>
                    <button type="submit" disabled={loading} className="bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition disabled:bg-primary/50">
                        {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentStep;