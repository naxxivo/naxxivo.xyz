
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { WishlistItem } from '../types';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistProductIds: Set<number>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistProductIds(new Set());
      setLoading(false);
      return;
    };

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } else {
      setWishlistItems(data as WishlistItem[]);
      setWishlistProductIds(new Set(data.map(item => item.product_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      // Clear wishlist on logout
      setWishlistItems([]);
      setWishlistProductIds(new Set());
      setLoading(false);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = async (productId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: user.id, product_id: productId }]);
    
    if (error) {
      console.error('Error adding to wishlist:', error);
    } else {
      await fetchWishlist(); // Re-fetch to update state
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .match({ user_id: user.id, product_id: productId });

    if (error) {
      console.error('Error removing from wishlist:', error);
    } else {
      await fetchWishlist(); // Re-fetch to update state
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, wishlistProductIds, addToWishlist, removeFromWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};