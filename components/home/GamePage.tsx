import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import Logo from '../common/Logo';
import { SearchIcon, BellIcon, CoinIcon, GameIcon } from '../common/AppIcons';
import type { Tables, Json } from '../../integrations/supabase/types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import CarromBoard from './CarromBoard';

interface GamePageProps {
    session: any;
    onViewProfile: (userId: string) => void;
    onOpenSearch: () => void;
    onOpenNotifications: () => void;
    unreadNotificationCount: number;
}

type GameState = 'lobby' | 'searching' | 'in-game';
type CarromGame = Tables<'carrom_games'>;
type Profile = Tables<'profiles'> & { active_cover: { preview_url: string | null, asset_details: Json } | null };


const GameLobby: React.FC<{ onPlayRandom: () => void; profile: Profile | null }> = ({ onPlayRandom, profile }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                <Avatar
                    photoUrl={profile?.photo_url}
                    name={profile?.name}
                    activeCover={profile?.active_cover}
                    size="xl"
                />
            </motion.div>
            <h2 className="text-2xl font-bold mt-4 text-[var(--theme-text)]">{profile?.name || profile?.username}</h2>
            <div className="flex items-center gap-2 mt-2 bg-[var(--theme-card-bg-alt)] px-4 py-2 rounded-full">
                <CoinIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-bold text-[var(--theme-text)]">{profile?.gold_coins?.toLocaleString() || 0}</span>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-xs mt-12 space-y-4">
                <Button onClick={onPlayRandom} size="large" className="w-full flex items-center justify-center !h-16 text-xl">
                    <GameIcon className="mr-3" />
                    Play (100 Coins)
                </Button>
                <Button variant="secondary" size="large" className="w-full !h-14" disabled>
                    Invite a Friend
                </Button>
            </motion.div>
        </div>
    );
};


const GamePage: React.FC<GamePageProps> = ({ session, onViewProfile, onOpenSearch, onOpenNotifications, unreadNotificationCount }) => {
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [currentGame, setCurrentGame] = useState<CarromGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const myId = session.user.id;
    const gameChannelRef = useRef<any>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, active_cover:active_cover_id(preview_url, asset_details)')
                .eq('id', myId)
                .single();

            if (error) throw error;
            setProfile(data as any);
        } catch (err: any) {
            setError(err.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    }, [myId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const cleanupGame = useCallback(() => {
        if (gameChannelRef.current) {
            supabase.removeChannel(gameChannelRef.current);
            gameChannelRef.current = null;
        }
        setCurrentGame(null);
        setGameState('lobby');
    }, []);

    useEffect(() => {
        if (gameChannelRef.current) {
            supabase.removeChannel(gameChannelRef.current);
            gameChannelRef.current = null;
        }

        if (currentGame?.id && (gameState === 'searching' || gameState === 'in-game')) {
            gameChannelRef.current = supabase
                .channel(`carrom_game_${currentGame.id}`)
                .on<CarromGame>(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'carrom_games',
                        filter: `id=eq.${currentGame.id}`,
                    },
                    (payload) => {
                        const updatedGame = payload.new;
                        setCurrentGame(updatedGame);
                        if (updatedGame.status === 'active' && gameState === 'searching') {
                            setGameState('in-game');
                        }
                        if (updatedGame.status === 'finished' || updatedGame.status === 'abandoned') {
                            alert(`Game over! Winner: ${updatedGame.winner_id}`);
                            cleanupGame();
                            fetchProfile();
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (gameChannelRef.current) {
                supabase.removeChannel(gameChannelRef.current);
            }
        };
    }, [currentGame?.id, gameState, cleanupGame, fetchProfile]);

    const handlePlayRandom = async () => {
        setGameState('searching');
        setError(null);
        const betAmount = 100;

        if (profile && profile.gold_coins < betAmount) {
            setError("You don't have enough coins to play.");
            setGameState('lobby');
            return;
        }

        const { data, error: rpcError } = await supabase.rpc('find_or_create_carrom_match', {
            bet_amount: betAmount,
        });

        if (rpcError) {
            setError(`Matchmaking Error: ${rpcError.message}`);
            setGameState('lobby');
            await fetchProfile();
            return;
        }
        
        const responseData = data as { error?: string; status: 'joined' | 'created'; game: CarromGame };

        if (responseData.error) {
            setError(responseData.error);
            setGameState('lobby');
            await fetchProfile(); // Re-fetch profile in case coins were deducted then refunded
            return;
        }

        setCurrentGame(responseData.game);
        await fetchProfile(); // Re-fetch profile to show updated coin balance

        if (responseData.status === 'joined' || responseData.game.status === 'active') {
            setGameState('in-game');
        }
    };
    
    const handleCancelSearch = async () => {
        if (!currentGame || currentGame.status !== 'waiting') return;
        
        // Disable the button to prevent multiple clicks
        setGameState('lobby');

        const { data, error: rpcError } = await supabase.rpc('cancel_carrom_matchmaking', {
            game_id_to_cancel: currentGame.id,
        });
        
        if (rpcError || (data && data.startsWith('Error'))) {
            setError(data || rpcError?.message || 'Failed to cancel search.');
            setGameState('searching'); // Re-enable cancel button if failed
        } else {
            cleanupGame();
            await fetchProfile();
        }
    };

    if (loading) {
        return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="h-screen flex flex-col">
            <header className="flex-shrink-0 flex justify-between items-center p-4">
                <div className="text-3xl"><Logo/></div>
                <div className="flex items-center space-x-4">
                    <button onClick={onOpenSearch} className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]"><SearchIcon /></button>
                    <button onClick={onOpenNotifications} className="relative text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)]">
                        <BellIcon />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--theme-bg)]" />
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-grow">
                 {error && <div className="bg-red-500/10 text-red-500 p-3 text-center text-sm rounded-md m-4" role="alert"><p>{error}</p></div>}
                <AnimatePresence mode="wait">
                    {gameState === 'lobby' && (
                         <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                            <GameLobby onPlayRandom={handlePlayRandom} profile={profile} />
                        </motion.div>
                    )}
                    {gameState === 'searching' && (
                        <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-[var(--theme-text-secondary)]">Searching for an opponent...</p>
                            <Button variant="secondary" onClick={handleCancelSearch} className="mt-6 w-auto px-6">
                                Cancel
                            </Button>
                        </motion.div>
                    )}
                    {gameState === 'in-game' && currentGame && (
                        <motion.div key="game" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-full p-4">
                            <CarromBoard game={currentGame} myId={myId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default GamePage;