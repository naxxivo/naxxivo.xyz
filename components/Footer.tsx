
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-accent border-t border-gray-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* About */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-text-primary mb-4">Nordic.</h3>
            <p className="text-gray-600 dark:text-text-muted text-sm max-w-xs">
              Bringing minimalist, high-quality design to your home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-text-primary mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-text-muted">
              <li><Link to="/shop" className="hover:text-primary transition">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-text-primary mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-text-muted">
              <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-primary transition">Track Order</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="font-semibold text-gray-900 dark:text-text-primary mb-4">Join Our Newsletter</h4>
            <p className="text-sm text-gray-600 dark:text-text-muted mb-4">Get 10% off your first order and stay up-to-date with our latest products and deals.</p>
            <form className="flex">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-text-primary rounded-l-md focus:ring-primary focus:border-primary" />
              <button type="submit" className="bg-primary text-background dark:text-white px-6 py-2 rounded-r-md hover:bg-yellow-600 transition">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800 text-center text-sm text-gray-500 dark:text-text-muted">
          <p>&copy; {new Date().getFullYear()} Nordic Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;