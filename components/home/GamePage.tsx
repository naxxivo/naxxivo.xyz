import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import LoadingSpinner from '../common/LoadingSpinner';
import Logo from '../common/Logo';
import { SearchIcon, BellIcon, CoinIcon, GameIcon } from '../common/AppIcons';
import type { Tables, Json, Enums } from '../../integrations/supabase/types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import CarromBoard from './CarromBoard';
import InviteFriendModal from './InviteFriendModal';

interface GamePageProps {
    session: any;
    onViewProfile: (userId: string) => void;
    onOpenSearch: () => void;
    onOpenNotifications: () => void;
    unreadNotificationCount: number;
    initialGame: CarromGame | null;
    onGameEnd: () => void;
}

type GameState = 'lobby' | 'searching' | 'in-game' | 'waiting-for-invite-response';
type CarromGame = Tables<'carrom_games'>;
type GameInvite = Tables<'game_invites'>;
type Profile = Tables<'profiles'> & { active_cover: { preview_url: string | null, asset_details: Json } | null };


const GameLobby: React.FC<{ onPlayRandom: () => void; profile: Profile | null; onInvite: () => void; }> = ({ onPlayRandom, profile, onInvite }) => {
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
                <Button onClick={onInvite} variant="secondary" size="large" className="w-full !h-14">
                    Invite a Friend
                </Button>
            </motion.div>
        </div>
    );
};


const GamePage: React.FC<GamePageProps> = ({ session, onViewProfile, onOpenSearch, onOpenNotifications, unreadNotificationCount, initialGame, onGameEnd }) => {
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [currentGame, setCurrentGame] = useState<CarromGame | null>(null);
    const [sentInvite, setSentInvite] = useState<GameInvite | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

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
    
    useEffect(() => {
        if (initialGame) {
            setCurrentGame(initialGame);
            setGameState('in-game');
        }
    }, [initialGame]);

    const cleanupGame = useCallback(() => {
        if (gameChannelRef.current) {
            supabase.removeChannel(gameChannelRef.current);
            gameChannelRef.current = null;
        }
        setCurrentGame(null);
        setSentInvite(null);
        setGameState('lobby');
        onGameEnd();
    }, [onGameEnd]);

    useEffect(() => {
        if (gameChannelRef.current) {
            supabase.removeChannel(gameChannelRef.current);
            gameChannelRef.current = null;
        }

        const gameId = currentGame?.id;
        if (gameId && (gameState === 'searching' || gameState === 'in-game')) {
            gameChannelRef.current = supabase
                .channel(`carrom_game_${gameId}`)
                .on<CarromGame>(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'carrom_games', filter: `id=eq.${gameId}` },
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
        
        const inviteId = sentInvite?.id;
        if (inviteId && gameState === 'waiting-for-invite-response') {
             gameChannelRef.current = supabase
                .channel(`game_invite_${inviteId}`)
                .on<GameInvite>(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'game_invites', filter: `id=eq.${inviteId}` },
                    async (payload) => {
                        const updatedInvite = payload.new;
                        setSentInvite(updatedInvite);
                        if(updatedInvite.status === 'accepted' && updatedInvite.game_id) {
                             const { data: gameData, error: gameError } = await supabase
                                .from('carrom_games')
                                .select('*')
                                .eq('id', updatedInvite.game_id)
                                .single();
                            if (gameData) {
                                setCurrentGame(gameData);
                                setGameState('in-game');
                            }
                        } else if (updatedInvite.status === 'declined') {
                            setError("Your invitation was declined.");
                            cleanupGame();
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
    }, [currentGame?.id, sentInvite?.id, gameState, cleanupGame, fetchProfile]);

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
            await fetchProfile();
            return;
        }

        setCurrentGame(responseData.game);
        await fetchProfile(); 

        if (responseData.status === 'joined' || responseData.game.status === 'active') {
            setGameState('in-game');
        }
    };
    
    const handleCancelSearch = async () => {
        if (!currentGame || currentGame.status !== 'waiting') return;
        
        setGameState('lobby');

        const { data, error: rpcError } = await supabase.rpc('cancel_carrom_matchmaking', {
            game_id_to_cancel: currentGame.id,
        });
        
        if (rpcError || (data && data.startsWith('Error'))) {
            setError(data || rpcError?.message || 'Failed to cancel search.');
            setGameState('searching');
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
                            <GameLobby onPlayRandom={handlePlayRandom} profile={profile} onInvite={() => setInviteModalOpen(true)} />
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
                     {gameState === 'waiting-for-invite-response' && (
                        <motion.div key="waiting-invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-[var(--theme-text-secondary)]">Waiting for response...</p>
                            {/* TODO: Add a cancel invite button */}
                        </motion.div>
                    )}
                    {gameState === 'in-game' && currentGame && (
                        <motion.div key="game" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-full p-4">
                            <CarromBoard game={currentGame} myId={myId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
             {isInviteModalOpen && (
                <InviteFriendModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                    session={session}
                    onInviteSent={(invite) => {
                        setSentInvite(invite);
                        setGameState('waiting-for-invite-response');
                    }}
                />
            )}
        </div>
    );
};

export default GamePage;