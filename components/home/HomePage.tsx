import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import type { Tables } from '../../integrations/supabase/types';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@supabase/auth-js';

type Game = Tables<'tic_tac_toe_games'>;
type GameStatus = 'idle' | 'searching' | 'playing' | 'finished';

interface GamePageProps {
    session: Session;
    onStatusChange: (status: GameStatus) => void;
    newGameTrigger: number;
}

const GamePage: React.FC<GamePageProps> = ({ session, onStatusChange, newGameTrigger }) => {
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
    const myId = session.user.id;

    const findOrCreateGame = useCallback(async () => {
        setLoading(true);
        onStatusChange('searching');
        setError(null);
        setGame(null);

        try {
            // Try to join an existing game
            const { data: waitingGames, error: findError } = await supabase
                .from('tic_tac_toe_games')
                .select('*')
                .eq('status', 'waiting_for_player')
                .neq('player1_id', myId)
                .limit(1);

            if (findError) throw findError;

            if (waitingGames && waitingGames.length > 0) {
                // Join game
                const gameToJoin = waitingGames[0];
                const { data: updatedGame, error: joinError } = await supabase
                    .from('tic_tac_toe_games')
                    .update({ player2_id: myId, status: 'in_progress' })
                    .eq('id', gameToJoin.id)
                    .select()
                    .single();
                
                if (joinError) throw joinError;
                setGame(updatedGame);
                setPlayerSymbol('O');
            } else {
                // Create a new game
                const { data: newGame, error: createError } = await supabase
                    .from('tic_tac_toe_games')
                    .insert({ player1_id: myId, current_turn: myId })
                    .select()
                    .single();
                
                if (createError) throw createError;
                setGame(newGame);
                setPlayerSymbol('X');
            }
        } catch (err: any) {
            setError(err.message || "Failed to find or create a game.");
            onStatusChange('idle');
        } finally {
            setLoading(false);
        }
    }, [myId, onStatusChange]);

    useEffect(() => {
        if (newGameTrigger > 0) {
            findOrCreateGame();
        }
    }, [newGameTrigger, findOrCreateGame]);
    
    useEffect(() => {
        if (!game) return;

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

        // Optimistic update
        const newBoard = [...game.board];
        newBoard[index] = playerSymbol!;
        setGame({ ...game, board: newBoard, current_turn: null }); // Temporarily disable moves

        const { error: moveError } = await supabase.rpc('handle_tic_tac_toe_move', {
            game_id: game.id,
            cell_index: index,
        });
        
        if (moveError) {
            setError(moveError.message);
            // Revert optimistic update (or just wait for realtime to fix it)
        }
    };
    
    const getGameStatusText = () => {
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

    const statusText = getGameStatusText();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
            <h1 className="font-logo text-5xl text-[var(--theme-text)] mb-4">Tic-Tac-Toe</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {!game && !loading && (
                 <div className="flex flex-col items-center gap-4">
                    <p className="text-[var(--theme-text-secondary)]">Press the play button below to find a match!</p>
                </div>
            )}
            
            {(loading || game?.status === 'waiting_for_player') && (
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-lg font-semibold text-[var(--theme-text)] animate-pulse">{statusText}</p>
                </div>
            )}

            {game && game.status !== 'waiting_for_player' && (
                <div className="flex flex-col items-center w-full max-w-xs">
                     <p className={`text-xl font-bold mb-4 transition-colors ${game.current_turn === myId ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`}>
                        {statusText}
                    </p>
                    <div className="grid grid-cols-3 gap-3 w-full aspect-square">
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
            )}
        </div>
    );
};

export default GamePage;
