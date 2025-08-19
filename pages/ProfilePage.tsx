import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Order, Address, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import AddressForm from '../components/AddressForm';
import { TablesUpdate } from '../integrations/supabase/types';


const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!isAuthenticated) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600 dark:text-text-muted text-lg mb-4">Please log in to view your account.</p>
                <Link to="/login" className="bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition">
                    Go to Login
                </Link>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrdersSection />;
            case 'wishlist':
                return <WishlistSection />;
            case 'addresses':
                return <AddressesSection />;
            case 'payment':
                return <PaymentMethodsSection />;
            case 'settings':
                return <SettingsSection />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
                <h1 className="text-4xl font-bold font-display mb-4 sm:mb-0">My Account</h1>
                <button onClick={handleLogout} className="text-sm font-medium text-gray-600 dark:text-text-muted hover:text-primary transition self-start sm:self-center">Log Out</button>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <nav className="lg:w-1/4">
                    <ul className="space-y-2">
                        <li><button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'orders' ? 'bg-primary text-background dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-accent'}`}>My Orders</button></li>
                        <li><button onClick={() => setActiveTab('wishlist')} className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'wishlist' ? 'bg-primary text-background dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-accent'}`}>Wishlist</button></li>
                        <li><button onClick={() => setActiveTab('addresses')} className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'addresses' ? 'bg-primary text-background dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-accent'}`}>Saved Addresses</button></li>
                        <li><button onClick={() => setActiveTab('payment')} className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'payment' ? 'bg-primary text-background dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-accent'}`}>Payment Methods</button></li>
                        <li><button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'settings' ? 'bg-primary text-background dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-accent'}`}>Settings</button></li>
                    </ul>
                </nav>
                <main className="lg:w-3/4">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const OrdersSection: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setLoading(true);
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products ( name, image_url )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error("Error fetching orders:", ordersError);
            } else {
                setOrders(ordersData as Order[] || []);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user]);

    if (loading) return <p>Loading orders...</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <p>You have not placed any orders yet.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-accent p-6 rounded-lg border border-gray-200 dark:border-slate-800">
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
                            <div>
                                <h3 className="font-semibold">Order #{order.id}</h3>
                                <p className="text-sm text-gray-500 dark:text-text-muted">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>{order.status}</span>
                        </div>
                        <div className="space-y-4">
                             {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4">
                                    <img src={item.products?.image_url || ''} alt={item.products?.name} className="w-16 h-16 object-cover rounded-md"/>
                                    <div>
                                        <p className="font-medium">{item.products?.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-text-muted">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-right mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <span className="font-semibold">Total: ${order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const WishlistSection: React.FC = () => {
    const { wishlistItems, loading } = useWishlist();

    if (loading) return <p>Loading wishlist...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
            {wishlistItems.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map(item => (
                        <ProductCard key={item.id} product={item.products} />
                    ))}
                </div>
            )}
        </div>
    );
};

const AddressesSection: React.FC = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.error("Error fetching addresses:", error.message);
        } else {
            setAddresses(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [user]);

    const handleDelete = async (addressId: number) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        const { error } = await supabase.from('addresses').delete().eq('id', addressId);
        if (error) {
            alert('Could not delete address.');
            console.error(error);
        } else {
            fetchAddresses(); // Re-fetch addresses after deletion
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchAddresses();
    }

    if (loading) return <p>Loading addresses...</p>;

    return (
        <div className="bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Saved Addresses</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary text-background dark:text-white font-semibold py-2 px-4 rounded-md hover:bg-yellow-600 transition text-sm">
                    {showForm ? 'Cancel' : 'Add New Address'}
                </button>
            </div>
            
            {showForm && (
                <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-6">
                    <AddressForm onSuccess={handleFormSuccess} />
                </div>
            )}
            
            <div className="space-y-4">
                {addresses.map(address => (
                    <div key={address.id} className="border border-gray-200 dark:border-slate-700 p-4 rounded-md">
                        <div className="flex justify-between">
                            <p className="font-semibold">{address.label} {address.is_default && <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-text-primary px-2 py-1 rounded-full ml-2">Default</span>}</p>
                            <div>
                               <button className="text-sm text-primary hover:underline mr-4">Edit</button>
                               <button onClick={() => handleDelete(address.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-text-muted">{address.address_line_1}</p>
                        <p className="text-gray-600 dark:text-text-muted">{address.city}, {address.postal_code}, {address.country}</p>
                    </div>
                ))}
                {addresses.length === 0 && !showForm && <p>You have no saved addresses.</p>}
            </div>
        </div>
    );
};


const PaymentMethodsSection: React.FC = () => (
    <div className="bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
        <p>You have no saved payment methods.</p>
        {/* Payment methods functionality to be built */}
    </div>
);

const SettingsSection: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); // Use maybeSingle to avoid error if profile doesn't exist yet

            if (error) {
                console.error("Error fetching profile:", error.message);
            } else if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const profileUpdates: TablesUpdate<'profiles'> = {
            full_name: fullName,
        };

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);

        if (error) {
            alert('Could not update profile: ' + error.message);
            console.error(error);
        } else {
            alert('Profile updated successfully!');
            if (profile) {
                // Optimistically update profile state to reflect changes immediately
                setProfile({ ...profile, full_name: fullName });
            }
        }
    };

    if (loading) return <p>Loading settings...</p>;

    return (
        <div className="bg-white dark:bg-accent p-8 rounded-lg border border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-text-primary">Email Address</label>
                    <input type="email" defaultValue={user?.email || ''} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-text-muted" />
                </div>
                <div className="pt-4">
                    <button type="submit" className="bg-primary text-background dark:text-white font-semibold py-2 px-6 rounded-md hover:bg-yellow-600 transition">Save Changes</button>
                </div>
            </form>
        </div>
    );
};


export default ProfilePage;