
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const OrderSuccessPage: React.FC = () => {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, []); // clearCart is stable, so empty array is fine

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-success font-display">Thank You!</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text-primary mt-4">Your Order has been Placed</h2>
            <p className="text-gray-600 dark:text-text-muted mt-2 max-w-md">
                You will receive an email confirmation shortly. You can track your order status in the "My Orders" section of your account.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                    to="/profile"
                    className="bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-full hover:bg-yellow-600 transition"
                >
                    View My Orders
                </Link>
                <Link
                    to="/shop"
                    className="bg-gray-100 dark:bg-accent text-gray-900 dark:text-text-primary font-semibold py-3 px-8 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;