import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, Enums } from '../../integrations/supabase/types';
import { BackArrowIcon, GoldCoinIcon, SilverCoinIcon, DiamondIcon } from '../common/AppIcons';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatXp } from '../../utils/helpers';
import Button from '../common/Button';

// --- PROPS & TYPES --- //
interface LuckRoyalePageProps {
    onBack: () => void;
    session: Session;
    showNotification: (details: any) => void;
}
type Prize = Tables<'luck_royale_prizes'> & {
    store_items: Pick<Tables<'store_items'>, 'id' | 'name' | 'preview_url'> | null
};
type Config = {
    costs: { [K in Currency]: { single: number, ten: number } },
    duplicate_consolation: { type: string, amount: number };
    is_active: boolean;
};
type Currency = Enums<'currency'>;
type Rarity = Enums<'luck_royale_rarity'>;
type ResultItem = {
    type: 'item' | 'consolation' | 'currency';
    details: {
        id?: number;
        name?: string;
        preview_url?: string;
        rarity?: Rarity;
        type?: Enums<'currency'> | 'XP';
        amount?: number;
    };
};

// --- HELPERS & STYLES --- //
const currencyIcons: Record<string, React.FC<{ className?: string }>> = { GOLD: GoldCoinIcon, SILVER: SilverCoinIcon, DIAMOND: DiamondIcon };
const rarityStyles: Record<Rarity, { text: string, bg: string, border: string, glow: string }> = {
    COMMON: { text: 'text-gray-300', bg: 'bg-slate-700', border: 'border-gray-500', glow: 'rarity-glow-COMMON' },
    RARE: { text: 'text-blue-300', bg: 'bg-blue-900/50', border: 'border-blue-500', glow: 'rarity-glow-RARE' },
    LEGENDARY: { text: 'text-yellow-300', bg: 'bg-yellow-800/50', border: 'border-yellow-500', glow: 'rarity-glow-LEGENDARY' },
};
const rarityOrder: Record<Rarity, number> = { 'LEGENDARY': 3, 'RARE': 2, 'COMMON': 1 };

// --- SUB-COMPONENTS --- //
const RewardItem = ({ result }: { result: ResultItem }) => {
    const rarity = result.details.rarity || 'COMMON';
    const styles = rarityStyles[rarity];

    if (result.type === 'item') {
        return <img src={result.details.preview_url || ''} alt={result.details.name} className="max-h-full max-w-full object-contain" />;
    }
    const Icon = currencyIcons[result.details.type!];
    const color = result.details.type === 'GOLD' ? 'text-yellow-400' : result.details.type === 'SILVER' ? 'text-gray-400' : 'text-cyan-400';
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon className={`w-8 h-8 ${color}`} />
            <p className={`font-bold text-lg mt-1 ${color}`}>{formatXp(result.details.amount!)}</p>
        </div>
    );
};

// --- MAIN COMPONENT --- //
const LuckRoyalePage: React.FC<LuckRoyalePageProps> = ({ onBack, session, showNotification }) => {
    const [config, setConfig] = useState<Config | null>(null);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(true);
    const [animationState, setAnimationState] = useState<'idle' | 'revealing' | 'finished'>('idle');
    const [spinResult, setSpinResult] = useState<ResultItem[] | null>(null);
    const [revealedItems, setRevealedItems] = useState<ResultItem[]>([]);
    const [userBalances, setUserBalances] = useState({ GOLD: 0, SILVER: 0, DIAMOND: 0 });
    const [activeCurrency, setActiveCurrency] = useState<Currency>('GOLD');
    const [grandPrize, setGrandPrize] = useState<Prize | null>(null);

    const fetchData = useCallback(async (initialLoad = false) => {
        if(initialLoad) setLoading(true);
        try {
            const [configRes, prizesRes, profileRes] = await Promise.all([
                supabase.from('app_settings').select('value').eq('key', 'luck_royale_config').single(),
                supabase.from('luck_royale_prizes').select('*, store_items(id, name, preview_url)').eq('is_active', true),
                supabase.from('profiles').select('gold_coins, silver_coins, diamond_coins').eq('id', session.user.id).single(),
            ]);

            if (configRes.error) throw new Error("Could not load event configuration.");
            setConfig(configRes.data.value as Config);

            if (prizesRes.error) throw prizesRes.error;
            setPrizes((prizesRes.data as Prize[]) || []);

            if (profileRes.error) throw profileRes.error;
            setUserBalances({ GOLD: profileRes.data.gold_coins || 0, SILVER: profileRes.data.silver_coins || 0, DIAMOND: profileRes.data.diamond_coins || 0 });

        } catch (err: any) {
            showNotification({ type: 'error', title: 'Error', message: err.message });
        } finally {
            if(initialLoad) setLoading(false);
        }
    }, [session.user.id, showNotification]);

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        const filtered = prizes.filter(p => p.currency === activeCurrency);
        const sorted = [...filtered].sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
        setGrandPrize(sorted.length > 0 ? sorted[0] : null);
    }, [prizes, activeCurrency]);

    const legendaryItem = useMemo(() => spinResult?.find(r => r.details.rarity === 'LEGENDARY'), [spinResult]);

    const handleSpin = async (spinCount: 1 | 10) => {
        if (animationState !== 'idle' || !config) return;
        setAnimationState('revealing');
        try {
            const { data, error } = await supabase.rpc('spin_luck_royale', { spin_count: spinCount, p_currency: activeCurrency });
            if (error) throw error;
            if (data.error) throw new Error(data.error);
            const results = data.prizes as ResultItem[];
            const sortedResults = [...results].sort((a, b) => (rarityOrder[a.details.rarity || 'COMMON'] || 0) - (rarityOrder[b.details.rarity || 'COMMON'] || 0));
            setSpinResult(sortedResults);
        } catch (err: any) {
            showNotification({ type: 'error', title: 'Spin Failed', message: err.message });
            setAnimationState('idle');
        }
    };
    
    useEffect(() => {
        if (animationState === 'revealing' && spinResult) {
            let revealTimeout = 1200; // Initial delay for portal
            spinResult.forEach((item, index) => {
                setTimeout(() => {
                    setRevealedItems(prev => [...prev, item]);
                }, revealTimeout + index * 600);
            });
            const totalDuration = revealTimeout + spinResult.length * 600 + (legendaryItem ? 2000 : 1000);
            setTimeout(() => {
                setAnimationState('finished');
            }, totalDuration);
        }
    }, [animationState, spinResult, legendaryItem]);

    const handleReset = () => {
        setAnimationState('idle');
        setSpinResult(null);
        setRevealedItems([]);
        fetchData();
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-900"><LoadingSpinner/></div>;
    if (!config || !config.is_active) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-center p-8">
                <button onClick={onBack} className="absolute top-4 left-4"><BackArrowIcon/></button>
                <h2 className="text-xl font-semibold text-white">Event Not Active</h2>
                <p className="text-gray-400 mt-2">The Luck Royale event is currently offline. Check back later!</p>
            </div>
        );
    }
    
    const currentCost = config.costs[activeCurrency];

    return (
        <div className="h-screen bg-slate-900 text-gray-200 flex flex-col font-sans overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-900 to-slate-900 opacity-50"></div>
             {animationState === 'revealing' && <div className="charge-up-bg"></div>}

            <header className="relative z-20 flex-shrink-0 flex items-center p-4 bg-transparent justify-between">
                <button onClick={onBack} className="text-gray-300 hover:text-white p-2 bg-black/20 rounded-full"><BackArrowIcon /></button>
                <div className="flex items-center gap-2 text-sm font-bold bg-black/30 px-3 py-1.5 rounded-full border border-purple-400/20">
                    <GoldCoinIcon className="w-5 h-5 text-yellow-400"/> {formatXp(userBalances.GOLD)}
                    <SilverCoinIcon className="w-5 h-5 text-gray-400 ml-2"/> {formatXp(userBalances.SILVER)}
                    <DiamondIcon className="w-5 h-5 text-cyan-400 ml-2"/> {formatXp(userBalances.DIAMOND)}
                </div>
            </header>
            
            <div className="relative z-10 flex justify-center p-1 bg-slate-800/50 rounded-full my-2 mx-auto">
                {(['GOLD', 'SILVER', 'DIAMOND'] as Currency[]).map(currency => (
                    <button key={currency} onClick={() => setActiveCurrency(currency)} className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-colors ${activeCurrency === currency ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                        {activeCurrency === currency && <motion.div layoutId="active-currency-pill" className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full shadow-lg" />}
                        <span className="relative z-10 capitalize">{currency.toLowerCase()}</span>
                    </button>
                ))}
            </div>

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">
                 <AnimatePresence>
                    {animationState === 'idle' && (
                        <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center">
                            {grandPrize && grandPrize.store_items && 
                                <img src={grandPrize.store_items.preview_url || ''} alt={grandPrize.store_items.name || ''} className="w-48 h-48 object-contain drop-shadow-lg" />
                            }
                            <h2 className="text-2xl font-bold mt-2">{grandPrize?.store_items?.name}</h2>
                            <p className={`font-semibold uppercase ${rarityStyles[grandPrize?.rarity || 'COMMON'].text}`}>{grandPrize?.rarity}</p>
                        </motion.div>
                    )}

                    {animationState === 'revealing' && (
                         <motion.div key="revealing" className="w-full h-full flex flex-col items-center justify-center">
                            <div className="portal"></div>
                            {revealedItems.map((item, index) => (
                                <div key={index} style={{ animationDelay: `${index * 0.6}s` }}>
                                    <div className={`orb ${rarityStyles[item.details.rarity || 'COMMON'].glow}`}></div>
                                    <div className="item-reveal">
                                        <div className={`w-full h-full rounded-lg flex items-center justify-center p-2 ${rarityStyles[item.details.rarity || 'COMMON'].bg}`}>
                                            <RewardItem result={item} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {revealedItems.length === spinResult?.length && legendaryItem && (
                                <div className="legendary-spotlight" style={{ animationDelay: `${spinResult.length * 0.6}s` }}>
                                    <h2 className="legendary-text-slam">LEGENDARY!</h2>
                                </div>
                            )}
                         </motion.div>
                    )}

                    {animationState === 'finished' && spinResult && (
                         <motion.div key="finished" initial={{opacity:0}} animate={{opacity:1}} className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <h2 className="text-3xl font-bold">Your Rewards!</h2>
                            <div className="w-full max-w-sm grid grid-cols-5 gap-2">
                                {spinResult.map((item, index) => (
                                    <div key={index} className={`aspect-square rounded-lg flex items-center justify-center p-1 ${rarityStyles[item.details.rarity || 'COMMON'].bg} border ${rarityStyles[item.details.rarity || 'COMMON'].border}`}>
                                        <RewardItem result={item} />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleReset} className="w-auto px-8 mt-4">Awesome!</Button>
                         </motion.div>
                    )}
                 </AnimatePresence>
            </main>

            {animationState === 'idle' && (
                <footer className="relative z-20 w-full max-w-sm mx-auto p-4 space-y-3">
                    <motion.button
                        onClick={() => handleSpin(10)}
                        disabled={userBalances[activeCurrency] < currentCost.ten}
                        className="w-full relative py-4 px-6 text-lg font-bold text-white bg-gradient-to-b from-purple-600 to-purple-800 border-t-2 border-purple-400 rounded-lg shadow-[0_5px_0_0_#581c87] active:shadow-[0_2px_0_0_#581c87] active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Spin x10+1 <span className="text-purple-300">({currentCost.ten.toLocaleString()})</span>
                    </motion.button>
                     <motion.button
                        onClick={() => handleSpin(1)}
                        disabled={userBalances[activeCurrency] < currentCost.single}
                        className="w-full py-3 px-6 text-base font-semibold text-gray-300 bg-slate-800/80 border-t-2 border-slate-600 rounded-lg shadow-[0_4px_0_0_#1e293b] active:shadow-[0_2px_0_0_#1e293b] active:translate-y-0.5 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Spin x1 ({currentCost.single.toLocaleString()})
                    </motion.button>
                </footer>
            )}
        </div>
    );
};

export default LuckRoyalePage;
