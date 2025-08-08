import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Line } from 'react-konva';
import Konva from 'konva';
import Matter from 'matter-js';
import useImage from '../../hooks/useImage';
import type { Tables, GameState, GamePiece } from '../../integrations/supabase/types';
import { supabase } from '../../integrations/supabase/client';

// --- Constants ---
const BOARD_SIZE = 400;
const STRIKER_RADIUS = 12;
const PIECE_RADIUS = 8;
const POCKET_RADIUS = 15;
const WALL_THICKNESS = 20;
const FRICTION = 0.02;
const RESTITUTION = 0.8; // Bounciness

interface CarromBoardProps {
    game: Tables<'carrom_games'>;
    myId: string;
}

const PlayerInfo: React.FC<{ name: string; isMyTurn: boolean; score: number }> = ({ name, isMyTurn, score }) => (
    <div className={`p-2 rounded-lg text-center transition-all duration-300 ${isMyTurn ? 'bg-green-500/20 ring-2 ring-green-500' : 'bg-black/20'}`}>
        <p className="font-bold text-white truncate max-w-[100px]">{name}</p>
        <p className="font-bold text-lg text-yellow-300">{score}</p>
        {isMyTurn && <p className="text-xs text-green-300 animate-pulse">Your Turn</p>}
    </div>
);

const CarromBoard: React.FC<CarromBoardProps> = ({ game, myId }) => {
    const [boardImage] = useImage('https://i.imgur.com/sETi62x.png');
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const konvaLayerRef = useRef<Konva.Layer>(null);
    
    // Game state reflected on the canvas
    const [pieces, setPieces] = useState<GamePiece[]>([]);
    const [strikerPos, setStrikerPos] = useState({ x: 0, y: 0 });

    // Interaction state
    const [isAiming, setIsAiming] = useState(false);
    const [aimStartPos, setAimStartPos] = useState<{ x: number, y: number } | null>(null);
    const [aimEndPos, setAimEndPos] = useState<{ x: number, y: number } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const isMyTurn = game.current_turn === myId;
    const isPlayer1 = myId === game.player1_id;

    const bodiesMap = useRef<Map<string, Matter.Body>>(new Map());

    const initializePhysics = useCallback(() => {
        if (!game.game_state) return;
        const gameState = game.game_state as unknown as GameState;

        const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
        engineRef.current = engine;

        bodiesMap.current.clear();

        const createWall = (x: number, y: number, width: number, height: number) =>
            Matter.Bodies.rectangle(x, y, width, height, { isStatic: true, restitution: RESTITUTION, friction: FRICTION });

        const walls = [
            createWall(BOARD_SIZE / 2, -WALL_THICKNESS / 2, BOARD_SIZE, WALL_THICKNESS),
            createWall(BOARD_SIZE / 2, BOARD_SIZE + WALL_THICKNESS / 2, BOARD_SIZE, WALL_THICKNESS),
            createWall(-WALL_THICKNESS / 2, BOARD_SIZE / 2, WALL_THICKNESS, BOARD_SIZE),
            createWall(BOARD_SIZE + WALL_THICKNESS / 2, BOARD_SIZE / 2, WALL_THICKNESS, BOARD_SIZE),
        ];
        Matter.Composite.add(engine.world, walls);

        // Add pieces
        gameState.pieces.forEach(p => {
            const body = Matter.Bodies.circle(p.x, p.y, PIECE_RADIUS, { restitution: RESTITUTION, friction: FRICTION, frictionAir: FRICTION });
            Matter.Composite.add(engine.world, body);
            bodiesMap.current.set(p.id, body);
        });

        // Add striker
        const strikerBody = Matter.Bodies.circle(gameState.striker.x, gameState.striker.y, STRIKER_RADIUS, { restitution: RESTITUTION, friction: FRICTION, frictionAir: FRICTION });
        Matter.Composite.add(engine.world, strikerBody);
        bodiesMap.current.set('striker', strikerBody);

        setPieces(gameState.pieces);
        setStrikerPos(gameState.striker);

    }, [game.game_state]);

    useEffect(() => {
        initializePhysics();

        const engine = engineRef.current;
        if (!engine) return;

        const runner = Matter.Runner.create();
        runnerRef.current = runner;
        
        const update = () => {
            const allBodies = Matter.Composite.allBodies(engine.world);
            let isMoving = false;
            for (const body of allBodies) {
                if (body.speed > 0.1) {
                    isMoving = true;
                    break;
                }
            }

            if (isAnimating && !isMoving) {
                // Animation finished, handle turn end
                setIsAnimating(false);
                handleTurnEnd();
            }

            // Update Konva shapes positions
            setPieces(currentPieces => currentPieces.map(p => {
                const body = bodiesMap.current.get(p.id);
                return body ? { ...p, x: body.position.x, y: body.position.y } : p;
            }));
            const strikerBody = bodiesMap.current.get('striker');
            if (strikerBody) {
                setStrikerPos({ x: strikerBody.position.x, y: strikerBody.position.y });
            }
        };

        Matter.Events.on(runner, 'afterUpdate', update);
        Matter.Runner.run(runner, engine);

        return () => {
            if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
            if (engineRef.current) Matter.Engine.clear(engineRef.current);
        };
    }, [initializePhysics]);

    const handleTurnEnd = async () => {
        const pockets = [
            { x: POCKET_RADIUS, y: POCKET_RADIUS },
            { x: BOARD_SIZE - POCKET_RADIUS, y: POCKET_RADIUS },
            { x: POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
            { x: BOARD_SIZE - POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
        ];

        const finalPieces: GamePiece[] = [];
        const currentGameState = game.game_state as unknown as GameState;
        let newScore = { ...currentGameState.score };

        for (const piece of pieces) {
            const body = bodiesMap.current.get(piece.id);
            if (!body) continue;

            const isPocketed = pockets.some(pocket => 
                Matter.Vector.magnitude(Matter.Vector.sub(body.position, pocket)) < POCKET_RADIUS
            );
            
            if (isPocketed) {
                if (piece.color === (isPlayer1 ? 'white' : 'black')) {
                    newScore = isPlayer1 ? { ...newScore, player1: newScore.player1 + 1 } : { ...newScore, player2: newScore.player2 + 1 };
                } else if (piece.color !== 'red') {
                     newScore = isPlayer1 ? { ...newScore, player2: newScore.player2 + 1 } : { ...newScore, player1: newScore.player1 + 1 };
                }
            } else {
                 finalPieces.push({ ...piece, x: body.position.x, y: body.position.y });
            }
        }
        
        const strikerBody = bodiesMap.current.get('striker');
        const finalStrikerPos = strikerBody ? { x: strikerBody.position.x, y: strikerBody.position.y } : { x: 200, y: 330 };
        
        const newGameState: GameState = {
            pieces: finalPieces,
            striker: finalStrikerPos,
            score: newScore,
        };

        await supabase.rpc('submit_carrom_turn', {
            p_game_id: game.id,
            p_new_game_state: newGameState as any,
        });
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isMyTurn || isAnimating) return;
        setIsAiming(true);
        setAimStartPos({ x: strikerPos.x, y: strikerPos.y });
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isAiming || !aimStartPos) return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if(!pos) return;
        setAimEndPos(pos);
    };

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isAiming || !aimStartPos || !aimEndPos) return;
        setIsAiming(false);
        setIsAnimating(true);
        
        const strikerBody = bodiesMap.current.get('striker');
        if (!strikerBody) return;

        const force = Matter.Vector.mult(Matter.Vector.sub(aimStartPos, aimEndPos), 0.005);
        Matter.Body.applyForce(strikerBody, strikerBody.position, force);
        
        setAimStartPos(null);
        setAimEndPos(null);
    };

    const gameState = game.game_state as unknown as GameState;

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg p-2 text-white">
            <header className="flex justify-between items-center mb-2">
                <PlayerInfo name={`Player 1`} isMyTurn={game.current_turn === game.player1_id} score={gameState?.score?.player1 || 0} />
                <div className="text-center">
                    <p className="text-xl font-bold text-yellow-400">{game.pot_amount} Coins</p>
                </div>
                <PlayerInfo name={`Player 2`} isMyTurn={!!game.player2_id && game.current_turn === game.player2_id} score={gameState?.score?.player2 || 0} />
            </header>
            
            <main className="flex-grow flex items-center justify-center rounded-md overflow-hidden relative">
                 <Stage 
                    width={BOARD_SIZE} 
                    height={BOARD_SIZE} 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                 >
                    <Layer ref={konvaLayerRef}>
                        {boardImage && <KonvaImage image={boardImage} width={BOARD_SIZE} height={BOARD_SIZE} />}
                        
                        {/* Pieces */}
                        {pieces.map(piece => (
                            <Circle 
                                key={piece.id} 
                                x={piece.x} 
                                y={piece.y} 
                                radius={PIECE_RADIUS}
                                fill={piece.color === 'red' ? '#e53e3e' : piece.color}
                                stroke="rgba(0,0,0,0.3)"
                                strokeWidth={1}
                            />
                        ))}

                        {/* Striker */}
                        <Circle 
                            x={strikerPos.x}
                            y={strikerPos.y}
                            radius={STRIKER_RADIUS}
                            fill="#FEEBC8"
                            stroke="#D69E2E"
                            strokeWidth={2}
                            shadowColor="black"
                            shadowBlur={5}
                            shadowOpacity={0.5}
                        />

                        {/* Aiming Line */}
                        {isAiming && aimStartPos && aimEndPos && (
                            <Line
                                points={[aimStartPos.x, aimStartPos.y, aimEndPos.x, aimEndPos.y]}
                                stroke="rgba(255, 255, 255, 0.5)"
                                strokeWidth={2}
                                dash={[10, 5]}
                            />
                        )}
                    </Layer>
                </Stage>
            </main>
        </div>
    );
};

// Simple hook to load an image
const useImage = (url: string) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    useEffect(() => {
        const img = new window.Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => setImage(img);
    }, [url]);
    return [image];
};


export default CarromBoard;