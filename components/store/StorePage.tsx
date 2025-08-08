import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { BackArrowIcon, CoinIcon, UploadIcon } from '../common/AppIcons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { formatXp } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, Enums, Json } from '../../integrations/supabase/types';
import type { Session } from '@supabase/auth-js';
import ConfirmationModal from '../common/ConfirmationModal';

interface StorePageProps {
    onBack: () => void;
    session: Session;
    onNavigateToUploadCover: () => void;
    showNotification: (details: any) => void;
}

type StoreCategory = 'Featured' | 'Profile FX' | 'Profile Covers' | 'Themes' | 'Badges';
type StoreItem = Tables<'store_items'> & {
    profiles: { username: string } | null;
};

const ItemCard = ({ item, onPurchase, onPreview, isOwned, canAfford }: { item: StoreItem, onPurchase: (item: StoreItem) => void, onPreview: (item: StoreItem) => void, isOwned: boolean, canAfford: boolean }) => {

    const handlePurchase = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPurchase(item);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[var(--theme-card-bg)] rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
            <div className="w-full h-32 bg-[var(--theme-bg)] flex items-center justify-center p-2">
                <img src={item.preview_url || undefined} alt={item.name} className={`object-contain max-h-full max-w-full ${item.category === 'PROFILE_FX' || item.category === 'PROFILE_COVER' ? 'h-24 w-24' : ''}`} />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-[var(--theme-text)]">{item.name}</h3>
                {item.created_by_user_id && item.profiles && <p className="text-xs text-[var(--theme-text-secondary)]">by @{item.profiles.username}</p>}
                <p className="text-xs text-[var(--theme-text-secondary)] flex-grow mt-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center font-bold text-lg text-[var(--theme-primary)]">
                        <CoinIcon className="w-5 h-5 mr-1" />
                        <span>{item.price > 0 ? formatXp(item.price) : 'Free'}</span>
                    </div>
                </div>
                 <Button onClick={handlePurchase} disabled={isOwned || !canAfford} size="small" className="w-full mt-2">
                    {isOwned ? 'Owned' : (canAfford ? 'Purchase' : 'Not enough XP')}
                </Button>
            </div>
        </motion.div>
    );
};

const StorePage: React.FC<StorePageProps> = ({ onBack, session, onNavigateToUploadCover, showNotification }) => {
    const [activeTab, setActiveTab] = useState<StoreCategory>('Featured');
    const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<StoreItem[]>([]);
    const [ownedItemIds, setOwnedItemIds] = useState<Set<number>>(new Set());
    const [userXp, setUserXp] = useState(0);
    const [confirmingPurchase, setConfirmingPurchase] = useState<StoreItem | null>(null);


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemsRes, inventoryRes, profileRes] = await Promise.all([
                supabase.from('store_items').select('*, profiles:created_by_user_id(username)').eq('is_active', true).eq('is_approved', true),
                supabase.from('user_inventory').select('item_id').eq('user_id', session.user.id),
                supabase.from('profiles').select('xp_balance').eq('id', session.user.id).single()
            ]);

            if (itemsRes.error) throw itemsRes.error;
            setItems((itemsRes.data as any) || []);

            if (inventoryRes.error) throw inventoryRes.error;
            setOwnedItemIds(new Set(inventoryRes.data.map(i => i.item_id)));

            if (profileRes.error) throw profileRes.error;
            setUserXp(profileRes.data.xp_balance);

        } catch (err: any) {
            showNotification({ type: 'error', title: 'Error', message: `Error loading store: ${err.message}` });
        } finally {
            setLoading(false);
        }
    }, [session.user.id, showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePurchaseClick = (item: StoreItem) => {
        setConfirmingPurchase(item);
    };

    const handleConfirmPurchase = async () => {
        if (!confirmingPurchase) return;

        setIsPurchasing(true);
        const { data, error } = await supabase.rpc('buy_store_item', { p_item_id: confirmingPurchase.id });
        
        if (error) {
            showNotification({ type: 'error', title: 'Purchase Failed', message: error.message });
        } else if (data && data.startsWith('Error:')) {
            showNotification({ type: 'error', title: 'Purchase Failed', message: data });
        } else {
            showNotification({ type: 'success', title: 'Purchase Successful!', message: data || `You now own ${confirmingPurchase.name}.` });
            await fetchData(); // Refresh data after purchase
        }
        setIsPurchasing(false);
        setConfirmingPurchase(null);
    };

    const filteredItems = items.filter(item => {
        if (activeTab === 'Featured') return true; // Or add a `is_featured` flag to your table
        if (activeTab === 'Profile FX') return item.category === 'PROFILE_FX';
        if (activeTab === 'Profile Covers') return item.category === 'PROFILE_COVER';
        if (activeTab === 'Themes') return item.category === 'THEME';
        if (activeTab === 'Badges') return item.category === 'BADGE';
        return false;
    });

    return (
        <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">The Bazaar</h1>
                <div className="w-auto flex items-center gap-1 text-sm font-bold bg-black/20 text-white px-2 py-1 rounded-full">
                    <CoinIcon className="w-5 h-5 text-yellow-300"/>
                    {formatXp(userXp)}
                </div>
            </header>

            <div className="p-2 flex-shrink-0">
                <div className="flex bg-[var(--theme-card-bg-alt)] p-1 rounded-full w-full">
                    {(['Featured', 'Profile FX', 'Profile Covers', 'Themes', 'Badges'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative flex-1 py-1.5 px-2 text-sm font-medium focus:outline-none transition-colors"
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="store-tab-active"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="absolute inset-0 bg-[var(--theme-card-bg)] rounded-full shadow"
                                />
                            )}
                            <span className={`relative z-10 ${activeTab === tab ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-secondary)]'}`}>
                                {tab}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-grow overflow-y-auto p-4">
                 {loading ? (
                     <div className="flex justify-center pt-20"><LoadingSpinner /></div>
                 ) : (
                    <motion.div layout className="grid grid-cols-2 gap-4">
                        <AnimatePresence>
                            {activeTab === 'Profile Covers' && (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={onNavigateToUploadCover}
                                    className="bg-[var(--theme-card-bg)] rounded-xl shadow-sm flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-[var(--theme-secondary)]/50 hover:border-[var(--theme-primary)] transition-colors"
                                >
                                    <UploadIcon className="w-10 h-10 text-[var(--theme-primary)]"/>
                                    <h3 className="font-bold text-[var(--theme-text)] mt-2">Upload Your Own</h3>
                                    <p className="text-xs text-[var(--theme-text-secondary)] mt-1">Cost: 25,000 XP</p>
                                </motion.button>
                            )}
                            {filteredItems.map(item => (
                                <ItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onPurchase={handlePurchaseClick} 
                                    onPreview={setPreviewItem} 
                                    isOwned={ownedItemIds.has(item.id)}
                                    canAfford={userXp >= item.price}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                 )}
            </main>

            <AnimatePresence>
                {previewItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div
                             initial={{ scale: 0.9 }}
                             animate={{ scale: 1 }}
                             exit={{ scale: 0.9 }}
                             className="bg-[var(--theme-card-bg)] rounded-xl p-4 w-full max-w-sm text-center"
                             onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-bold text-[var(--theme-text)]">Preview: {previewItem.name}</h2>
                            <div className="my-4 h-48 bg-[var(--theme-bg)] rounded-lg flex items-center justify-center p-2">
                                <img src={previewItem.preview_url || undefined} alt={previewItem.name} className={`object-contain max-h-full max-w-full ${previewItem.category === 'PROFILE_FX' || previewItem.category === 'PROFILE_COVER' ? 'h-32 w-32' : ''}`} />
                            </div>
                            <Button onClick={() => setPreviewItem(null)} variant="secondary">Close</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {confirmingPurchase && (
                <ConfirmationModal
                    isOpen={!!confirmingPurchase}
                    onClose={() => setConfirmingPurchase(null)}
                    onConfirm={handleConfirmPurchase}
                    title="Confirm Purchase"
                    message={`Are you sure you want to buy "${confirmingPurchase.name}" for ${confirmingPurchase.price} XP?`}
                    confirmText="Yes, Buy Now"
                    isConfirming={isPurchasing}
                />
            )}
        </div>
    );
};

export default StorePage;