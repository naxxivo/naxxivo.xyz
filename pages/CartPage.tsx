import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold font-display text-center mb-8">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div className="text-center bg-white dark:bg-accent p-12 rounded-lg border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-600 dark:text-text-muted text-xl">Your cart is empty.</p>
                    <Link to="/shop" className="mt-6 inline-block bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
                            <h2 className="text-xl font-semibold">Your Items</h2>
                            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
                        </div>
                        <div className="space-y-6">
                        {cartItems.map(item => (
                            <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center space-x-4 border-b border-gray-200 dark:border-slate-800 pb-6 last:border-b-0 last:pb-0">
                                <img src={item.image_url || ''} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-text-muted">Color: {item.selectedColor}</p>
                                    <p className="text-sm text-gray-500 dark:text-text-muted">Size: {item.selectedSize}</p>
                                    <button onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)} className="text-red-500 text-sm mt-1 hover:underline">Remove</button>
                                </div>
                                <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-md">
                                    <button onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)} className="px-2 py-1">-</button>
                                    <span className="px-3">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)} className="px-2 py-1">+</button>
                                </div>
                                <p className="font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                             <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">Order Summary</h2>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-slate-700 pt-2">
                                    <span>Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Discount Code</h3>
                                <div className="flex">
                                    <input type="text" placeholder="Enter code" className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-l-md focus:ring-primary focus:border-primary"/>
                                    <button className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-text-primary px-4 py-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-slate-600">Apply</button>
                                </div>
                            </div>
                            <Link to="/checkout" className="w-full block text-center mt-6 bg-primary text-background dark:text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition">
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default CartPage;