import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { GoldCoinIcon, SilverCoinIcon, DiamondIcon, TrophyIcon } from '../common/AppIcons';
import { formatXp } from '../../utils/helpers';
import type { Enums } from '../../integrations/supabase/types';

interface ResultItem {
    type: 'item' | 'consolation' | 'currency';
    details: {
        id?: number;
        name?: string;
        preview_url?: string;
        rarity?: Enums<'luck_royale_rarity'>;
        type?: Enums<'currency'> | 'XP';
        amount?: number;
    };
}

interface SpinResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: ResultItem[];
}

const rarityStyles: Record<Enums<'luck_royale_rarity'>, { text: string, bg: string, border: string }> = {
    COMMON: { text: 'text-gray-300', bg: 'bg-slate-700', border: 'border-gray-500' },
    RARE: { text: 'text-blue-300', bg: 'bg-blue-900/50', border: 'border-blue-500' },
    LEGENDARY: { text: 'text-yellow-300', bg: 'bg-yellow-800/50', border: 'border-yellow-500' },
};

const currencyIcons: Record<string, React.FC<{ className?: string }>> = {
    GOLD: GoldCoinIcon,
    SILVER: SilverCoinIcon,
    DIAMOND: DiamondIcon,
    XP: TrophyIcon,
};
const currencyColors: Record<string, string> = {
    GOLD: 'text-yellow-400',
    SILVER: 'text-gray-400',
    DIAMOND: 'text-cyan-400',
    XP: 'text-violet-400',
}

const ResultCard = ({ result, delay }: { result: ResultItem, delay: number }) => {
    const rarity = result.details.rarity || 'COMMON';

    if (result.type === 'item') {
        return (
            <motion.div
                {...{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: delay * 0.15 },
                } as any}
                className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center"
            >
                <div className={`aspect-square flex items-center justify-center rounded-lg p-2 ${rarityStyles[rarity].bg} border ${rarityStyles[rarity].border}`}>
                    <img src={result.details.preview_url || ''} alt={result.details.name} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="text-xs font-bold mt-2 truncate text-gray-200">{result.details.name}</p>
                <p className={`text-[10px] font-bold uppercase ${rarityStyles[rarity].text}`}>{rarity}</p>
            </motion.div>
        );
    }
    
    if (result.type === 'currency') {
        const Icon = currencyIcons[result.details.type!];
        return (
             <motion.div
                {...{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: delay * 0.15 },
                } as any}
                className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center"
            >
                <div className={`aspect-square flex flex-col items-center justify-center rounded-lg p-2 ${rarityStyles[rarity].bg} border ${rarityStyles[rarity].border}`}>
                    <Icon className={`w-8 h-8 ${currencyColors[result.details.type!]}`} />
                    <p className={`font-bold text-sm mt-1 ${currencyColors[result.details.type!]}`}>+{formatXp(result.details.amount!)}</p>
                </div>
                <p className="text-xs font-bold mt-2 truncate text-gray-200">{result.details.type}</p>
                <p className={`text-[10px] font-bold uppercase ${rarityStyles[rarity].text}`}>{rarity}</p>
            </motion.div>
        );
    }

    if (result.type === 'consolation') {
        const Icon = result.details.type ? currencyIcons[result.details.type] : null;
        const color = result.details.type ? currencyColors[result.details.type] : 'text-gray-400';
        return (
            <motion.div
                {...{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: delay * 0.15 },
                } as any}
                className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center"
            >
                <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-slate-700">
                    {Icon && <Icon className={`w-8 h-8 ${color}`} />}
                    <p className={`text-lg font-bold ${color}`}>+{formatXp(result.details.amount || 0)}</p>
                </div>
                <p className="text-xs font-bold mt-2 truncate text-gray-200">Consolation Prize</p>
                <p className="text-[10px] font-bold uppercase text-gray-500">DUPLICATE</p>
            </motion.div>
        );
    }
    return null;
};

const SpinResultModal: React.FC<SpinResultModalProps> = ({ isOpen, onClose, results }) => {
    const isSingleItem = results.length === 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    {...{
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                    } as any}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        {...{
                            initial: { scale: 0.9, y: 20 },
                            animate: { scale: 1, y: 0 },
                            exit: { scale: 0.9, y: 20 },
                            transition: { type: 'spring', stiffness: 300, damping: 30 },
                        } as any}
                        className="bg-slate-800 border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl p-6 relative flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">You Won!</h2>
                        
                        <div className={`w-full grid ${isSingleItem ? 'grid-cols-1 justify-items-center' : 'grid-cols-3 md:grid-cols-5'} gap-3 max-h-[60vh] overflow-y-auto pr-2`}>
                            {results.map((result, index) => (
                                <div key={index} className={isSingleItem ? 'w-40' : ''}>
                                    <ResultCard result={result} delay={index} />
                                </div>
                            ))}
                        </div>
                        
                        <Button onClick={onClose} className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600">
                            Awesome!
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpinResultModal;