import React from 'react';
import type { Tables } from '../../integrations/supabase/types';

interface CarromBoardProps {
    game: Tables<'carrom_games'>;
    myId: string;
}

const PlayerInfo: React.FC<{ name: string, isMyTurn: boolean }> = ({ name, isMyTurn }) => (
    <div className={`p-3 rounded-lg text-center ${isMyTurn ? 'bg-green-500/20 ring-2 ring-green-500' : 'bg-black/20'}`}>
        <p className="font-bold text-white">{name}</p>
        {isMyTurn && <p className="text-xs text-green-300 animate-pulse">Your Turn</p>}
    </div>
);


const CarromBoard: React.FC<CarromBoardProps> = ({ game, myId }) => {
    // This is a placeholder for the actual game board UI and logic.
    // We will use react-konva for rendering and matter-js for physics later.
    const isMyTurn = game.current_turn === myId;

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg p-2 text-white">
            <header className="flex justify-between items-center mb-2">
                <PlayerInfo name="Player 1" isMyTurn={game.current_turn === game.player1_id} />
                <div className="text-center">
                    <p className="text-xl font-bold text-yellow-400">{game.pot_amount} Coins</p>
                    <p className="text-xs text-gray-400">Total Pot</p>
                </div>
                <PlayerInfo name="Player 2" isMyTurn={!!game.player2_id && game.current_turn === game.player2_id} />
            </header>
            
            <main className="flex-grow flex items-center justify-center bg-green-800 rounded-md border-4 border-yellow-700">
                <div className="text-center p-4">
                    <h2 className="text-2xl font-bold">Carrom Board</h2>
                    <p className="text-sm mt-2">Game logic and physics simulation will be implemented here.</p>
                    {/* TODO: Render the board state from game.game_state using a canvas library */}
                </div>
            </main>
            
            <footer className="mt-2 text-center">
                {isMyTurn ? (
                    <p className="text-lg font-semibold text-white">Drag and release your striker to play.</p>
                ) : (
                    <p className="text-sm text-gray-400">Waiting for opponent's move...</p>
                )}
            </footer>
        </div>
    );
};

export default CarromBoard;