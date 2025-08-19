
import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCheckout } from '../../context/CheckoutContext';

const CheckoutSummary: React.FC = () => {
    const { cartItems, cartTotal } = useCart();
    const { checkoutState } = useCheckout();
    
    const shippingCost = checkoutState.deliveryMethod?.cost || 0;
    const total = cartTotal + shippingCost;

    return (
        <div className="sticky top-24 bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">Order Summary</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center space-x-3">
                        <div className="relative">
                            <img src={item.image_url || ''} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 dark:bg-slate-600 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-sm leading-tight">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-text-muted">{item.selectedColor} / {item.selectedSize}</p>
                        </div>
                        <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-text-muted">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-text-muted">Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;