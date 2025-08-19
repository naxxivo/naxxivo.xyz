
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SignUpPage from './pages/SignUpPage';
import { supabase } from './integrations/supabase/client';

// Admin Imports
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductListPage from './pages/admin/ProductListPage';
import OrderListPage from './pages/admin/OrderListPage';
import CustomerListPage from './pages/admin/CustomerListPage';


const App: React.FC = () => {
  useEffect(() => {
    // This effect adds listeners to handle potential Supabase session issues
    // that can occur when the browser tab is inactive or the device goes offline.
    // The Supabase client's token auto-refresh can be affected by browser throttling.

    // Handles when the network connection is restored.
    const handleOnline = () => {
      console.log('Network status: online. Ensuring Supabase connection is active.');
      supabase.auth.getSession();
    };

    // Handles when the browser tab becomes visible again.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible. Re-checking Supabase session to prevent token expiry issues.');
        supabase.auth.getSession();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup the event listeners when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <HashRouter>
                <div className="bg-white dark:bg-background font-sans text-gray-900 dark:text-text-primary flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ProductListingPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<DashboardPage />} />
                          <Route path="products" element={<ProductListPage />} />
                          <Route path="orders" element={<OrderListPage />} />
                          <Route path="customers" element={<CustomerListPage />} />
                        </Route>
                      </Route>

                      {/* Not Found */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </HashRouter>
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
