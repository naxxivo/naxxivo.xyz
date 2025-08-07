
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import { BackArrowIcon } from '../common/AppIcons';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { motion } from 'framer-motion';

interface SubscriptionClaimPageProps {
    onBack: () => void;
    session: Session;
}

type SubscriptionWithProduct = Tables<'user_subscriptions'> & {
    products: {
        name: string;
        subscription_duration_days: number | null;
        subscription_daily_xp: number | null;
    } | null;
};
type Claim = Tables<'daily_claims'>;

const SubscriptionClaimPage: React.FC<SubscriptionClaimPageProps> = ({ onBack, session }) => {
    const [subscription, setSubscription] = useState<SubscriptionWithProduct | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const myId = session.user.id;
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: subData, error: subError } = await supabase
                .from('user_subscriptions')
                .select(`*, products (name, subscription_duration_days, subscription_daily_xp)`)
                .eq('user_id', myId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (subError) {
                if (subError.code !== 'PGRST116') throw subError;
            }
            setSubscription(subData as unknown as SubscriptionWithProduct | null);
            
            if(subData) {
                const { data: claimData, error: claimError } = await supabase
                    .from('daily_claims')
                    .select('*')
                    .eq('user_subscription_id', subData.id);
                
                if (claimError) throw claimError;
                setClaims(claimData || []);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load subscription data.');
        } finally {
            setLoading(false);
        }
    }, [myId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleClaim = async () => {
        if (!subscription) return;
        setIsClaiming(true);
        try {
            const { error: rpcError } = await supabase.rpc('claim_daily_xp', { p_subscription_id: subscription.id });
            if(rpcError) throw rpcError;
            
            alert(`You've claimed your daily XP!`);
            await fetchData();
            
        } catch (err: any) {
             alert(err.message || 'Failed to claim XP. You may have already claimed today or there was an error.');
             console.error(err);
        } finally {
            setIsClaiming(false);
        }
    };
    
    const today = new Date().toISOString().split('T')[0];
    const hasClaimedToday = claims.some(c => c.claim_date === today);

    const renderClaimGrid = () => {
        if (!subscription || !subscription.products) return null;
        const totalDays = subscription.products.subscription_duration_days || 7;
        const startDate = new Date(subscription.start_date);
        
        return (
            <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: totalDays }).map((_, i) => {
                    const dayDate = new Date(startDate);
                    dayDate.setDate(startDate.getDate() + i);
                    const dayDateStr = dayDate.toISOString().split('T')[0];
                    const claim = claims.find(c => c.claim_date === dayDateStr);
                    
                    const isToday = dayDateStr === today;
                    const isFuture = dayDate > new Date();

                    let statusClasses = 'bg-gray-200 text-gray-400';
                    if(claim) {
                        statusClasses = 'bg-green-100 text-green-700';
                    } else if (isToday) {
                         statusClasses = 'bg-violet-100 text-violet-700 animate-pulse';
                    } else if (!isFuture) {
                         statusClasses = 'bg-red-100 text-red-600';
                    }

                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-2 rounded-lg text-center aspect-square flex flex-col justify-center items-center ${statusClasses}`}
                        >
                            <span className="text-xs font-medium">{`Day ${i + 1}`}</span>
                            <span className="text-sm font-bold mt-1">{claim ? `+${claim.claimed_xp}` : ''}</span>
                        </motion.div>
                    )
                })}
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-gray-50">
             <header className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><BackArrowIcon /></button>
                <h1 className="text-xl font-bold text-gray-800 mx-auto">My Subscriptions</h1>
                <div className="w-6"></div>
            </header>
            
            <main className="p-4">
                 {loading ? <div className="flex justify-center pt-20"><LoadingSpinner /></div> :
                  error ? <p className="text-red-500 text-center">{error}</p> :
                  !subscription ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-semibold text-gray-700">No Active Subscriptions</h2>
                        <p className="text-gray-500 mt-2">Purchase a plan to start earning daily XP!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
                            <h2 className="text-lg font-bold text-gray-800">Your {subscription.products?.name || 'Pass'}</h2>
                            <p className="text-sm text-gray-500">Active until: {new Date(subscription.end_date).toLocaleDateString()}</p>
                            <Button className="mt-4" onClick={handleClaim} disabled={hasClaimedToday || isClaiming}>
                                {isClaiming ? 'Claiming...' : hasClaimedToday ? 'Claimed Today!' : `Claim ${subscription.products?.subscription_daily_xp || ''} XP`}
                            </Button>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Claim Progress</h3>
                             {renderClaimGrid()}
                        </div>
                    </div>
                  )}
            </main>
        </div>
    );
};

export default SubscriptionClaimPage;