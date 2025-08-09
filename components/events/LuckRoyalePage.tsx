import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Session } from '@supabase/auth-js';
import type { Tables, Enums, Json } from '../../integrations/supabase/types';
import { BackArrowIcon, GoldCoinIcon, SilverCoinIcon, DiamondIcon } from '../common/AppIcons';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatXp } from '../../utils/helpers';
import SpinResultModal from './SpinResultModal';

interface LuckRoyalePageProps {
    onBack: () => void;
    session: Session;
    showNotification: (details: any) => void;
}

type Prize = Tables<'luck_royale_prizes'> & {
    store_items: Pick<Tables<'store_items'>, 'id' | 'name' | 'preview_url'> | null
};
type Config = {
    costs: {
        GOLD: { single: number, ten: number },
        SILVER: { single: number, ten: number },
        DIAMOND: { single: number, ten: number },
    },
    duplicate_consolation: { type: string, amount: number };
    is_active: boolean;
};
type Currency = Enums<'currency'>;

const currencyIcons: Record<string, React.FC<{ className?: string }>> = {
    GOLD: GoldCoinIcon,
    SILVER: SilverCoinIcon,
    DIAMOND: DiamondIcon,
};
const currencyColors: Record<string, string> = {
    GOLD: 'text-yellow-400',
    SILVER: 'text-gray-400',
    DIAMOND: 'text-cyan-400',
}

const PrizeDisplay = ({ prize }: { prize: Prize }) => {
    if (prize.prize_type === 'CURRENCY') {
        const Icon = currencyIcons[prize.currency_type!];
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Icon className={`w-8 h-8 ${currencyColors[prize.currency_type!]}`} />
                <p className={`font-bold text-sm mt-1 ${currencyColors[prize.currency_type!]}`}>{formatXp(prize.currency_amount!)}</p>
            </div>
        );
    }
    return <img src={prize.store_items?.preview_url || ''} alt={prize.store_items?.name || ''} className="max-h-full max-w-full object-contain" />;
};


const LuckRoyalePage: React.FC<LuckRoyalePageProps> = ({ onBack, session, showNotification }) => {
    const [config, setConfig] = useState<Config | null>(null);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<any[] | null>(null);
    const [rotation, setRotation] = useState(0);
    const [userBalances, setUserBalances] = useState({ GOLD: 0, SILVER: 0, DIAMOND: 0 });
    const [activeCurrency, setActiveCurrency] = useState<Currency>('GOLD');

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
            setPrizes((prizesRes.data as any[]) || []);

            if (profileRes.error) throw profileRes.error;
            setUserBalances({
                GOLD: profileRes.data.gold_coins || 0,
                SILVER: profileRes.data.silver_coins || 0,
                DIAMOND: profileRes.data.diamond_coins || 0,
            });

        } catch (err: any) {
            showNotification({ type: 'error', title: 'Error', message: err.message });
        } finally {
            if(initialLoad) setLoading(false);
        }
    }, [session.user.id, showNotification]);

    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    const handleSpin = async (spinCount: 1 | 10) => {
        if (isSpinning || !config) return;

        const filteredPrizes = prizes.filter(p => p.currency === activeCurrency);
        if (filteredPrizes.length < 2) {
            showNotification({ type: 'error', title: 'Spin Failed', message: 'Not enough prizes in this pool to spin.' });
            return;
        }

        setIsSpinning(true);

        try {
            const { data, error } = await supabase.rpc('spin_luck_royale', { spin_count: spinCount, p_currency: activeCurrency });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            const results = data.prizes;
            let prizeToAnimateTo: Prize | null = null;

            if (spinCount === 1) {
                const mainResult = results.find((r: any) => r.type !== 'consolation');
                if (mainResult && mainResult.details) {
                    const matchedPrizeInPool = filteredPrizes.find(p => {
                        if (p.prize_type === 'ITEM' && mainResult.type === 'item') return p.item_id === mainResult.details.id;
                        if (p.prize_type === 'CURRENCY' && mainResult.type === 'currency') return p.currency_type === mainResult.details.type && p.currency_amount === mainResult.details.amount;
                        return false;
                    });

                    if (matchedPrizeInPool) {
                        prizeToAnimateTo = matchedPrizeInPool;
                    } else {
                        showNotification({
                            type: 'info',
                            title: 'Unexpected Prize!',
                            message: `A server mismatch occurred. You received a surprise prize not shown on this wheel.`
                        });
                        setTimeout(() => {
                            setSpinResult(results);
                            fetchData();
                        }, 500);
                        return;
                    }
                }
            }

            if (!prizeToAnimateTo) {
                const rarityOrder = { 'LEGENDARY': 3, 'RARE': 2, 'COMMON': 1 };
                prizeToAnimateTo = results
                    .map((result: any) => {
                        if (result.type === 'consolation' || !result.details) return null;
                        return filteredPrizes.find(p => {
                            if (p.prize_type === 'ITEM' && result.type === 'item') return p.item_id === result.details.id;
                            if (p.prize_type === 'CURRENCY' && result.type === 'currency') return p.currency_type === result.details.type && p.currency_amount === result.details.amount;
                            return false;
                        });
                    })
                    .filter((p: Prize | null): p is Prize => p !== null)
                    .sort((a: Prize, b: Prize) => (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0))[0];
            }

            if (!prizeToAnimateTo) {
                prizeToAnimateTo = filteredPrizes[0];
            }

            const targetPrizeIndex = Math.max(0, filteredPrizes.findIndex(p => p.id === prizeToAnimateTo!.id));

            const prizeCount = filteredPrizes.length;
            const segmentAngle = 360 / prizeCount;
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
            const targetAngle = (targetPrizeIndex * segmentAngle) + (segmentAngle / 2);
            const baseTargetAngle = 270 - targetAngle;

            setRotation(prev => {
                const spins = 8;
                const existingRevolutions = Math.ceil(prev / 360);
                const newTarget = (existingRevolutions + spins) * 360 + baseTargetAngle - randomOffset;
                return newTarget;
            });

            setTimeout(() => {
                setSpinResult(results);
                fetchData();
            }, 6000);

        } catch (err: any) {
            showNotification({ type: 'error', title: 'Spin Failed', message: err.message });
            setIsSpinning(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-slate-900"><LoadingSpinner/></div>;
    }

    if (!config || !config.is_active) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-center p-8">
                <h2 className="text-xl font-semibold text-white">Event Not Active</h2>
                <p className="text-gray-400 mt-2">The Luck Royale event is currently offline. Check back later!</p>
                <Button onClick={onBack} className="mt-4 w-auto mx-auto">Go Back</Button>
            </div>
        );
    }
    
    const filteredPrizes = prizes.filter(p => p.currency === activeCurrency);
    const numPrizes = Math.max(2, filteredPrizes.length);
    const segmentAngle = 360 / numPrizes;
    const currentCost = config.costs[activeCurrency];
    const ActiveCurrencyIcon = currencyIcons[activeCurrency];
    
    return (
        <>
        <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col font-sans">
            <header className="flex-shrink-0 flex items-center p-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-purple-500/20">
                <button onClick={onBack} className="text-gray-300 hover:text-white"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-white mx-auto tracking-widest uppercase">Luck Royale</h1>
                <div className={`w-auto flex items-center gap-2 text-sm font-bold ${currencyColors[activeCurrency]}/10 ${currencyColors[activeCurrency]} px-3 py-1.5 rounded-full border border-purple-400/20`}>
                    <ActiveCurrencyIcon className="w-5 h-5"/>
                    {formatXp(userBalances[activeCurrency])}
                </div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4 flex flex-col items-center justify-center">

                 <div className="flex justify-center p-1 bg-slate-800 rounded-full my-4">
                    {(['GOLD', 'SILVER', 'DIAMOND'] as Currency[]).map(currency => (
                        <button key={currency} onClick={() => setActiveCurrency(currency)} className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeCurrency === currency ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                            {activeCurrency === currency && <motion.div layoutId="active-currency-pill" className="absolute inset-0 bg-purple-600 rounded-full" />}
                            <span className="relative z-10 capitalize">{currency.toLowerCase()}</span>
                        </button>
                    ))}
                </div>

                <div className="relative w-80 h-80 md:w-96 md:h-96 my-6">
                    <div className="absolute top-[-28px] left-1/2 -translate-x-1/2 z-10">
                        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[28px] border-t-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]"></div>
                    </div>

                    <motion.div
                        className="w-full h-full rounded-full relative"
                        animate={{ rotate: rotation }}
                        transition={{ duration: 5.5, ease: [0.25, 1, 0.5, 1] }}
                    >
                        <div className="absolute inset-0 rounded-full bg-slate-800" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>
                        <div className="absolute inset-[-10px] rounded-full border-2 border-purple-500/50 animate-[spin-glow_4s_ease-in-out_infinite]"></div>
                        {filteredPrizes.map((prize, i) => (
                            <React.Fragment key={prize.id}>
                                <div
                                    className="absolute top-1/2 left-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-purple-500/80 to-transparent origin-left"
                                    style={{ transform: `rotate(${i * segmentAngle}deg)`, boxShadow: '0 0 5px rgba(192, 132, 252, 0.5)' }}
                                />
                                <div
                                    className="absolute top-0 left-0 w-full h-full"
                                    style={{ transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)` }}
                                >
                                    <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center">
                                        <div style={{ transform: `rotate(-${i * segmentAngle + segmentAngle / 2}deg)` }}>
                                            <PrizeDisplay prize={prize} />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                        <button 
                            onClick={() => handleSpin(1)}
                            disabled={isSpinning || userBalances[activeCurrency] < currentCost.single}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-900 rounded-full border-4 border-slate-700 flex items-center justify-center text-center group disabled:cursor-not-allowed"
                        >
                            <span className="font-bold text-lg text-purple-300 group-hover:scale-110 transition-transform group-disabled:scale-100 animate-[subtle-pulse_2s_ease-in-out_infinite]">SPIN</span>
                        </button>
                    </motion.div>
                </div>

                <div className="w-full max-w-sm space-y-2 my-4">
                     <motion.button
                        onClick={() => handleSpin(10)}
                        disabled={isSpinning || userBalances[activeCurrency] < currentCost.ten}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                        className="w-full relative overflow-hidden py-3 px-6 text-base font-bold text-purple-200 bg-purple-900/50 border-2 border-purple-500/50 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 animate-[shine_2s_ease-in-out_infinite]"></span>
                        Spin x10+1 ({currentCost.ten.toLocaleString()})
                    </motion.button>
                     <motion.button
                        onClick={() => handleSpin(1)}
                        disabled={isSpinning || userBalances[activeCurrency] < currentCost.single}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-2 px-6 text-base font-semibold text-gray-300 bg-slate-800/80 border-2 border-slate-700/80 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Spin x1 ({currentCost.single.toLocaleString()})
                    </motion.button>
                </div>

                <div className="mt-auto w-full max-w-lg pt-4">
                    <h3 className="font-bold text-center mb-2 text-gray-400 tracking-widest uppercase text-xs">Prize Pool</h3>
                     {filteredPrizes.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-slate-800/50 p-2 rounded-lg">
                            {filteredPrizes.map(prize => (
                                <div key={prize.id} title={prize.store_items?.name || `${prize.currency_amount} ${prize.currency_type}`} className={`relative group aspect-square rounded-lg p-1 border-2 border-slate-700 bg-slate-800`}>
                                    <div className="flex items-center justify-center h-full">
                                      <PrizeDisplay prize={prize} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm">No prizes available for this currency yet.</p>
                    )}
                </div>
            </main>
        </div>
        <SpinResultModal 
            isOpen={!!spinResult}
            onClose={() => { setSpinResult(null); setIsSpinning(false); }}
            results={spinResult || []}
        />
        </>
    );
};

export default LuckRoyalePage;