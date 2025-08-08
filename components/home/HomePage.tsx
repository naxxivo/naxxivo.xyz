import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables, Enums } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@supabase/auth-js';

type Game = Tables<'tic_tac_toe_games'>;
type Invite = Tables<'game_invites'>;
export type GameStatus = 'idle' | 'searching' | 'playing' | 'finished' | 'inviting';

interface GamePageProps {
    session: Session;
    onStatusChange: (status: GameStatus) => void;
    onInviteFriend: () => void;
    sentInvite: Invite | null;
    gameIdToPlay: string | null;
    onCancelInvite: (inviteId: string) => void;
}

const GamePage: React.FC<GamePageProps> = ({ session, onStatusChange, onInviteFriend, sentInvite, gameIdToPlay, onCancelInvite }) => {
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
    const myId = session.user.id;

    // Effect to handle loading a specific game
    useEffect(() => {
        const loadGame = async (gameId: string) => {
            setLoading(true);
            const { data, error } = await supabase.from('tic_tac_toe_games').select('*').eq('id', gameId).single();
            if (error) {
                setError("Could not load the game.");
            } else {
                setGame(data);
                setPlayerSymbol(data.player1_id === myId ? 'X' : 'O');
            }
            setLoading(false);
        };

        if (gameIdToPlay) {
            loadGame(gameIdToPlay);
        }
    }, [gameIdToPlay, myId]);
    

    const findOrCreateGame = useCallback(async () => {
        // ... (existing quick play logic)
    }, [myId, onStatusChange]);
    
    useEffect(() => {
        if (sentInvite) {
            onStatusChange('inviting');
        } else if (!game && !loading) {
            onStatusChange('idle');
        }
    }, [sentInvite, game, loading, onStatusChange]);

    
    useEffect(() => {
        if (!game || !game.id) return;

        if (game.status === 'in_progress') onStatusChange('playing');
        else if (game.status === 'finished') onStatusChange('finished');
        else if (game.status === 'waiting_for_player') onStatusChange('searching');

        const channel = supabase
            .channel(`game-${game.id}`)
            .on<Game>(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tic_tac_toe_games', filter: `id=eq.${game.id}` },
                (payload) => {
                    setGame(payload.new as Game);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [game, onStatusChange]);

    const handleCellClick = async (index: number) => {
        if (!game || game.status !== 'in_progress' || game.current_turn !== myId || game.board[index] !== '') return;

        const newBoard = [...game.board];
        newBoard[index] = playerSymbol!;
        setGame({ ...game, board: newBoard, current_turn: null });

        await supabase.rpc('handle_tic_tac_toe_move', {
            game_id: game.id,
            cell_index: index,
        });
    };
    
    const getGameStatusText = () => {
        if (sentInvite) return "Waiting for friend to accept...";
        if (!game) return "Ready to play?";
        if (game.status === 'waiting_for_player') return "Waiting for opponent...";
        if (game.status === 'finished') {
            if (game.winner_id === myId) return "You Win!";
            if (game.winner_id) return "You Lose!";
            return "It's a Draw!";
        }
        if (game.status === 'in_progress') {
            return game.current_turn === myId ? "Your Turn" : "Opponent's Turn";
        }
        return "";
    };

    if (game) {
        // --- Game Board View ---
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
                <h1 className="font-logo text-5xl text-[var(--theme-text)] mb-4">Tic-Tac-Toe</h1>
                 <p className={`text-xl font-bold mb-4 transition-colors ${game.current_turn === myId ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>
                    {getGameStatusText()}
                </p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs aspect-square">
                    {game.board.map((cell, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleCellClick(index)}
                            disabled={game.current_turn !== myId || cell !== '' || game.status !== 'in_progress'}
                            className="bg-[var(--theme-card-bg)] rounded-lg flex items-center justify-center text-5xl font-bold disabled:opacity-70"
                            whileTap={{ scale: 0.9 }}
                        >
                            <AnimatePresence>
                                {cell === 'X' && <motion.span initial={{scale:0}} animate={{scale:1}} className="text-red-500">X</motion.span>}
                                {cell === 'O' && <motion.span initial={{scale:0}} animate={{scale:1}} className="text-blue-500">O</motion.span>}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // --- Lobby View ---
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
            <h1 className="font-logo text-5xl text-[var(--theme-text)] mb-4">Tic-Tac-Toe</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <AnimatePresence mode="wait">
                {sentInvite ? (
                    <motion.div
                        key="inviting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <LoadingSpinner />
                        <p className="text-lg font-semibold text-[var(--theme-text)] animate-pulse">{getGameStatusText()}</p>
                        <Button variant="secondary" size="small" className="w-auto" onClick={() => onCancelInvite(sentInvite.id)}>Cancel Invite</Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="lobby"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-4 w-full max-w-xs"
                    >
                        <Button onClick={onInviteFriend}>Invite a Friend</Button>
                        <Button onClick={findOrCreateGame} variant="secondary">Quick Play</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamePage;