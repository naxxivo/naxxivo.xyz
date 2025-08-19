import { User } from '@supabase/supabase-js';
import { Json } from './integrations/supabase/types';

// Matches the 'products' table in Supabase
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  stock_status: string | null;
  variants: Json | null;
  details: Json | null;
  created_at: string;
  source_url?: string | null;
  is_external?: boolean | null;
  // This is added on the client-side
  isWishlisted?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// Matches the 'orders' table in Supabase
export interface Order {
    id: number;
    user_id: string;
    total_amount: number;
    status: string | null;
    shipping_address: Json | null;
    payment_status: string | null;
    created_at: string;
    // This will be fetched from 'order_items'
    order_items: OrderItem[];
    // Joined from profiles
    profiles?: { full_name: string | null } | null;
}

// Matches the 'order_items' table in Supabase
export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    // This will be added via a join
    products: Product | null;
    selected_variant?: Json | null;
}


// Matches the 'addresses' table in Supabase
export interface Address {
  id: number;
  user_id: string;
  label: string | null;
  is_default: boolean | null;
  address_line_1: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
}

// Matches the 'profiles' table in Supabase
export interface Profile {
  id: string;
  full_name: string | null;
  updated_at: string | null;
  role: string | null;
  // Joined from auth.users
  email?: string;
}

// This interface is not in the DB, but useful for the frontend
export interface PaymentMethod {
  id: number;
  type: 'Credit Card' | 'PayPal';
  isDefault: boolean;
  last4: string;
  expiry: string;
}

// Matches the 'wishlist_items' table for fetching
export interface WishlistItem {
    id: number;
    user_id: string;
    product_id: number;
    created_at: string;
    products: Product;
}

// For checkout flow
export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
}

export interface DeliveryMethod {
    id: string;
    name: string;
    cost: number;
    eta: string;
}

export interface CheckoutState {
    shippingAddress: ShippingAddress | null;
    deliveryMethod: DeliveryMethod | null;
}