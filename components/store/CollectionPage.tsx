import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { BackArrowIcon, CheckCircleIcon } from '../common/AppIcons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Tables, Enums } from '../../integrations/supabase/types';
import type { Session } from '@supabase/supabase-js';


interface CollectionPageProps {
    onBack: () => void;
    session: Session;
}

type CollectionCategory = 'All' | 'Profile FX' | 'Profile Covers' | 'Themes' | 'Badges';

type InventoryItem = Tables<'user_inventory'> & {
    store_items: Pick<Tables<'store_items'>, 'id' | 'name' | 'description' | 'preview_url' | 'category'> | null
};


const InventoryCard = ({ item, onEquip, isEquipped }: { item: InventoryItem, onEquip: (item: InventoryItem) => void, isEquipped: boolean }) => {
    
    if (!item.store_items) return null;

    return (
        <motion.div
            {...{
                layout: true,
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.8 },
                transition: { type: 'spring', stiffness: 300, damping: 25 },
            } as any}
            className="bg-[var(--theme-card-bg)] rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
            <div className="w-full h-32 bg-[var(--theme-bg)] flex items-center justify-center p-2">
                <img src={item.store_items.preview_url || undefined} alt={item.store_items.name} className={`object-contain max-h-full max-w-full ${item.store_items.category === 'PROFILE_FX' || item.store_items.category === 'PROFILE_COVER' ? 'h-24 w-24' : ''}`} />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-[var(--theme-text)]">{item.store_items.name}</h3>
                <p className="text-xs text-[var(--theme-text-secondary)] flex-grow mt-1">{item.store_items.description}</p>
                <Button 
                    onClick={() => onEquip(item)} 
                    size="small" 
                    variant={isEquipped ? 'secondary' : 'primary'}
                    className="w-full mt-3"
                >
                    {isEquipped ? <><CheckCircleIcon className="mr-2" /> Equipped</> : 'Equip'}
                </Button>
            </div>
        </motion.div>
    );
};

const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, session }) => {
    const [activeTab, setActiveTab] = useState<CollectionCategory>('All');
    const [ownedItems, setOwnedItems] = useState<InventoryItem[]>([]);
    const [equippedItemIds, setEquippedItemIds] = useState<{ fx: number | null, badge: number | null, cover: number | null }>({ fx: null, badge: null, cover: null });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [inventoryRes, profileRes] = await Promise.all([
                 supabase.from('user_inventory')
                    .select(`*, store_items (id, name, description, preview_url, category)`)
                    .eq('user_id', session.user.id),
                supabase.from('profiles')
                    .select('active_fx_id, active_badge_id, active_cover_id')
                    .eq('id', session.user.id)
                    .single()
            ]);

            if (inventoryRes.error) throw inventoryRes.error;
            setOwnedItems(inventoryRes.data || []);

            if (profileRes.error) throw profileRes.error;
            setEquippedItemIds({
                fx: profileRes.data.active_fx_id,
                badge: profileRes.data.active_badge_id,
                cover: profileRes.data.active_cover_id,
            });

        } catch (err: any) {
            alert(`Error loading collection: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEquip = async (item: InventoryItem) => {
        const { data, error } = await supabase.rpc('equip_inventory_item', { p_inventory_id: item.id });
        if(error) {
            alert(`Failed to equip item: ${error.message}`);
        } else {
            alert(data);
            await fetchData(); // Refresh to show new equipped state
        }
    };

    const filteredItems = ownedItems.filter(item => {
        if (activeTab === 'All' || !item.store_items) return true;
        if (activeTab === 'Profile FX') return item.store_items.category === 'PROFILE_FX';
        if (activeTab === 'Profile Covers') return item.store_items.category === 'PROFILE_COVER';
        if (activeTab === 'Themes') return item.store_items.category === 'THEME';
        if (activeTab === 'Badges') return item.store_items.category === 'BADGE';
        return false;
    });

    const isEquipped = (item: InventoryItem): boolean => {
        if (!item.store_items) return false;
        switch(item.store_items.category) {
            case 'PROFILE_FX': return equippedItemIds.fx === item.item_id;
            case 'PROFILE_COVER': return equippedItemIds.cover === item.item_id;
            case 'BADGE': return equippedItemIds.badge === item.item_id;
            default: return false;
        }
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col">
            <header className="flex-shrink-0 flex items-center p-4 border-b border-[var(--theme-secondary)]/30 bg-[var(--theme-header-bg)] sticky top-0 z-10">
                <button onClick={onBack} className="text-[var(--theme-header-text)] hover:opacity-80"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-[var(--theme-header-text)] mx-auto">My Satchel</h1>
                <div className="w-6"></div>
            </header>

            <div className="p-2 flex-shrink-0">
                <div className="flex bg-[var(--theme-card-bg-alt)] p-1 rounded-full w-full">
                    {(['All', 'Profile FX', 'Profile Covers', 'Themes', 'Badges'] as CollectionCategory[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="relative flex-1 py-1.5 px-2 text-sm font-medium focus:outline-none transition-colors"
                        >
                            {activeTab === tab && (
                                <motion.div
                                    {...{
                                        layoutId: "collection-tab-active",
                                        transition: { type: 'spring', stiffness: 300, damping: 30 },
                                    } as any}
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
                {loading ? <div className="flex justify-center pt-20"><LoadingSpinner /></div> : 
                 filteredItems.length > 0 ? (
                    <motion.div {...{layout:true} as any} className="grid grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredItems.map(item => (
                                <InventoryCard 
                                    key={item.id} 
                                    item={item} 
                                    onEquip={handleEquip} 
                                    isEquipped={isEquipped(item)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="text-center py-20 text-[var(--theme-text-secondary)]">
                        <p>No items in this category.</p>
                        <p className="text-sm">Visit The Bazaar to get new items!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CollectionPage;