import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "../../alive.css";
import collisionAlive from "../../assets/map/map-collision/alives";
import gameMapDataUrl from '../../assets/map/map-image/itsalive.png';

// --- CONSTANTS ---
const PLAYER_INITIAL_SPAWN = { x: 15, y: 12 };
const MOVEMENT_SPEED = 0.08;
const NPC_MOVEMENT_SPEED = 0.08;
const GRID_SIZE = 60;
const CELL_SIZE = 64;
const NPC_COUNT = 10;

const DIRECTIONS = { up: 'up', down: 'down', left: 'left', right: 'right' };
const KEYS = {
    'ArrowUp': DIRECTIONS.up, 'ArrowDown': DIRECTIONS.down, 'ArrowLeft': DIRECTIONS.left, 'ArrowRight': DIRECTIONS.right,
    'KeyW': DIRECTIONS.up, 'KeyS': DIRECTIONS.down, 'KeyA': DIRECTIONS.left, 'KeyD': DIRECTIONS.right,
};

// Helper function untuk kalkulasi sel yang bisa diakses (tanpa perubahan)
const calculateAccessibleCells = (map, startPos, gridSize) => {
    const accessible = new Set();
    const queue = [startPos];
    const visitedForBfs = new Set();
    if (!map[startPos.y] || map[startPos.y][startPos.x] === 1) return accessible;
    const startPosKey = `${startPos.x},${startPos.y}`;
    visitedForBfs.add(startPosKey);
    accessible.add(startPosKey);
    while (queue.length > 0) {
        const { x: currX, y: currY } = queue.shift();
        const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        for (const dir of directions) {
            const nextX = currX + dir.dx;
            const nextY = currY + dir.dy;
            const nextPosKey = `${nextX},${nextY}`;
            if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize &&
                map[nextY]?.[nextX] === 0 && !visitedForBfs.has(nextPosKey)) {
                visitedForBfs.add(nextPosKey);
                accessible.add(nextPosKey);
                queue.push({ x: nextX, y: nextY });
            }
        }
    }
    return accessible;
};


export default function Alive() {
    // --- STATE MANAGEMENT ---
    const [viewportDimensions, setViewportDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [gameMap, setGameMap] = useState(() => createInitialMap());
    const accessibleCellsSet = useMemo(() => calculateAccessibleCells(gameMap, PLAYER_INITIAL_SPAWN, GRID_SIZE), [gameMap]);

    // Player state
    const [playerPos, setPlayerPos] = useState(PLAYER_INITIAL_SPAWN);
    const [playerFacing, setPlayerFacing] = useState('down');
    const [playerWalking, setPlayerWalking] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(60);
    const [isWin, setIsWin] = useState(false);

    // *** PERUBAHAN 1: Buat ref untuk menyimpan posisi pemain ***
    const playerPosRef = useRef(playerPos);
    useEffect(() => {
        playerPosRef.current = playerPos;
    }, [playerPos]);


    // NPC state
    const [npcs, setNpcs] = useState([]);

    // Game state
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameMessage, setGameMessage] = useState("");
    const [pressedKeys, setPressedKeys] = useState(new Set());

    // --- VIEWPORT CALCULATION ---
    const VIEWPORT_WIDTH_CELLS = Math.floor((viewportDimensions.width * 1.027) / CELL_SIZE);
    const VIEWPORT_HEIGHT_CELLS = Math.floor((viewportDimensions.height * 1) / CELL_SIZE);
    const VIEWPORT_WIDTH_PIXELS = VIEWPORT_WIDTH_CELLS * CELL_SIZE;
    const VIEWPORT_HEIGHT_PIXELS = VIEWPORT_HEIGHT_CELLS * CELL_SIZE;

    // --- INITIALIZATION & RESET ---
    function createInitialMap() {
        const newMap = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                newMap[y][x] = collisionAlive[y * GRID_SIZE + x] !== 0 ? 1 : 0;
            }
        }
        newMap[PLAYER_INITIAL_SPAWN.y][PLAYER_INITIAL_SPAWN.x] = 0;
        return newMap;
    }

    const getRandomEmptyPosition = useCallback(() => {
        const accessibleArray = Array.from(accessibleCellsSet);
        if (accessibleArray.length <= 1) return PLAYER_INITIAL_SPAWN;

        let posKey;
        let x, y;
        do {
            posKey = accessibleArray[Math.floor(Math.random() * accessibleArray.length)];
            [x, y] = posKey.split(',').map(Number);
        } while (x === PLAYER_INITIAL_SPAWN.x && y === PLAYER_INITIAL_SPAWN.y);

        return { x, y };
    }, [accessibleCellsSet]);

    const initializeNpcs = useCallback(() => {
        if (accessibleCellsSet.size === 0) return;
        const initialNpcs = Array.from({ length: NPC_COUNT }, (_, i) => {
            const startPos = getRandomEmptyPosition();
            return {
                id: `npc-${i}`,
                x: startPos.x,
                y: startPos.y,
                path: [],
                facing: 'down',
                walking: false,
            };
        });
        setNpcs(initialNpcs);
    }, [getRandomEmptyPosition, accessibleCellsSet]);

    useEffect(() => {
        initializeNpcs();
    }, [initializeNpcs]);


    // --- EVENT LISTENERS ---
    const handleKeyDown = useCallback((e) => {
        if (KEYS[e.code]) setPressedKeys(prev => new Set([...prev, KEYS[e.code]]));
    }, []);
    const handleKeyUp = useCallback((e) => {
        if (KEYS[e.code]) setPressedKeys(prev => {
            const next = new Set(prev);
            next.delete(KEYS[e.code]);
            return next;
        });
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        const handleResize = () => setViewportDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleKeyDown, handleKeyUp]);

    // --- PATHFINDING ---
    const findPath = useCallback((start, end, map) => {
        const startGrid = { x: Math.round(start.x), y: Math.round(start.y) };
        const endGrid = { x: Math.round(end.x), y: Math.round(end.y) };
        const queue = [{ pos: startGrid, path: [] }];
        const visited = new Set([`${startGrid.x},${startGrid.y}`]);

        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            if (pos.x === endGrid.x && pos.y === endGrid.y) return path;

            const directions = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
            for (const dir of directions) {
                const nextX = pos.x + dir.dx;
                const nextY = pos.y + dir.dy;
                const nextPosKey = `${nextX},${nextY}`;
                if (nextX >= 0 && nextX < GRID_SIZE && nextY >= 0 && nextY < GRID_SIZE &&
                    map[nextY]?.[nextX] !== 1 && !visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    queue.push({ pos: { x: nextX, y: nextY }, path: [...path, { x: nextX, y: nextY }] });
                }
            }
        }
        return null; // No path found
    }, []);

    // --- GAME LOOP ---
    useEffect(() => {
        if (isGameOver || isWin) return;

        let animationFrameId;

        const gameLoop = () => {
            // 1. Update Player Position
            setPlayerPos(currentPos => {
                if (pressedKeys.size === 0 || isWin) {
                    setPlayerWalking(false);
                    return currentPos;
                }

                setPlayerWalking(true);
                const lastDirection = Array.from(pressedKeys).pop();
                if (lastDirection) setPlayerFacing(lastDirection);

                let dx = 0, dy = 0;
                pressedKeys.forEach(dir => {
                    if (dir === DIRECTIONS.right) dx += 1;
                    if (dir === DIRECTIONS.left) dx -= 1;
                    if (dir === DIRECTIONS.down) dy += 1;
                    if (dir === DIRECTIONS.up) dy -= 1;
                });

                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if (magnitude > 0) {
                    dx = (dx / magnitude) * MOVEMENT_SPEED;
                    dy = (dy / magnitude) * MOVEMENT_SPEED;
                }

                const nextX = currentPos.x + dx;
                const nextY = currentPos.y + dy;
                const nextGridX = Math.floor(nextX + 0.5);
                const nextGridY = Math.floor(nextY + 0.5);

                if (nextX >= 0 && nextX < GRID_SIZE - 1 && nextY >= 0 && nextY < GRID_SIZE - 1 && gameMap[nextGridY]?.[nextGridX] !== 1) {
                    return { x: nextX, y: nextY };
                }
                return currentPos;
            });

            // 2. Update NPC Positions
            setNpcs(currentNpcs => {
                // Pastikan jumlah NPC tetap sesuai
                if (currentNpcs.length < NPC_COUNT) {
                    return currentNpcs; // Biarkan pathfinding interval yang menangani reinisialisasi
                }

                return currentNpcs.map(npc => {
                    if (!npc.path || npc.path.length === 0) {
                        return { ...npc, walking: false };
                    }

                    const targetPos = npc.path[0];
                    const dx = targetPos.x - npc.x;
                    const dy = targetPos.y - npc.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < NPC_MOVEMENT_SPEED) {
                        const newPath = npc.path.slice(1);
                        return {
                            ...npc,
                            x: targetPos.x,
                            y: targetPos.y,
                            path: newPath,
                            walking: newPath.length > 0,
                        };
                    }

                    const moveDx = (dx / distance) * NPC_MOVEMENT_SPEED;
                    const moveDy = (dy / distance) * NPC_MOVEMENT_SPEED;

                    let facing = npc.facing;
                    if (Math.abs(moveDx) > Math.abs(moveDy)) {
                        facing = moveDx > 0 ? 'right' : 'left';
                    } else {
                        facing = moveDy > 0 ? 'down' : 'up';
                    }

                    return {
                        ...npc,
                        x: npc.x + moveDx,
                        y: npc.y + moveDy,
                        facing: facing,
                        walking: true,
                    };
                });
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [pressedKeys, isGameOver, gameMap]);


    // --- NPC PATHFINDING INTERVAL ---
    const MIN_NPC_DISTANCE = 2; // Jarak minimum antar NPC dalam grid units

    const getNPCDistance = (npc1, npc2) => {
        const dx = npc1.x - npc2.x;
        const dy = npc1.y - npc2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    useEffect(() => {
        if (isGameOver || isWin || npcs.length === 0) return;

        const pathfindingInterval = setInterval(() => {
            const currentPlayerPos = playerPosRef.current;

            setNpcs(currentNpcs => {
                if (currentNpcs.length < NPC_COUNT) {
                    console.warn(`NPC count (${currentNpcs.length}) is less than expected (${NPC_COUNT}). Re-initializing NPCs.`);
                    const newNpcs = Array.from({ length: NPC_COUNT }, (_, i) => {
                        const existingNpc = currentNpcs.find(npc => npc.id === `npc-${i}`);
                        if (existingNpc) return existingNpc;

                        const startPos = getRandomEmptyPosition();
                        return {
                            id: `npc-${i}`,
                            x: startPos.x,
                            y: startPos.y,
                            path: [],
                            facing: 'down',
                            walking: false,
                        };
                    });
                    return newNpcs;
                }

                return currentNpcs.map((npc, index) => {
                    // Cek apakah NPC ini terlalu dekat dengan NPC lain
                    const tooCloseToOthers = currentNpcs.some((otherNpc, otherIndex) => {
                        if (index === otherIndex) return false;
                        return getNPCDistance(npc, otherNpc) < MIN_NPC_DISTANCE;
                    });

                    let newPath = null;

                    // Jika terlalu dekat dengan NPC lain, cari path ke posisi random
                    if (tooCloseToOthers) {
                        const randomTarget = getRandomEmptyPosition();
                        newPath = findPath(npc, randomTarget, gameMap);
                    } else {
                        // Jika cukup jauh dari NPC lain, coba kejar player
                        newPath = findPath(npc, currentPlayerPos, gameMap);
                    }

                    // Jika tidak ada path sama sekali, cari path random
                    if (!newPath && (!npc.path || npc.path.length === 0)) {
                        const randomTarget = getRandomEmptyPosition();
                        newPath = findPath(npc, randomTarget, gameMap);
                    }

                    // Gunakan path baru jika ada, atau tetap dengan path lama
                    return newPath ? { ...npc, path: newPath } : npc;
                });
            });
        }, 750);

        return () => clearInterval(pathfindingInterval);
    }, [isGameOver, gameMap, findPath, npcs.length, getRandomEmptyPosition]);


    // --- GAME OVER CHECK ---
    useEffect(() => {
        if (isGameOver) return;
        const playerGridX = Math.round(playerPos.x);
        const playerGridY = Math.round(playerPos.y);
        for (const npc of npcs) {
            const npcGridX = Math.round(npc.x);
            const npcGridY = Math.round(npc.y);
            if (playerGridX === npcGridX && playerGridY === npcGridY) {
                setIsGameOver(true);
                setGameMessage("GAME OVER! Anda tertangkap.");
                setNpcs(npcs => npcs.map(n => ({ ...n, walking: false, path: [] })))
                return;
            }
        }
    }, [playerPos, npcs, isGameOver]);

    const resetGame = () => {
        setPlayerPos(PLAYER_INITIAL_SPAWN);
        initializeNpcs();
        setIsGameOver(false);
        setIsWin(false);
        setTimeLeft(60);
        setGameMessage("");
        setPressedKeys(new Set());
    };

    // --- WIN CHECK ---
    useEffect(() => {
        if (isGameOver || isWin) return;

        if (timeLeft === 0) {
            setIsWin(true);
            setGameMessage("Selamat! Anda berhasil bertahan selama 1 menit!");
            setNpcs(npcs => npcs.map(n => ({ ...n, walking: false, path: [] })))
        }
    }, [timeLeft, isGameOver, isWin]);

    // --- TIMER ---
    useEffect(() => {
        if (isGameOver || isWin) return;

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [isGameOver, isWin]);

    // --- CAMERA POSITION ---
    const camX = Math.max(Math.min(VIEWPORT_WIDTH_PIXELS / 2 - playerPos.x * CELL_SIZE, 0), -(GRID_SIZE * CELL_SIZE - VIEWPORT_WIDTH_PIXELS));
    const camY = Math.max(Math.min(VIEWPORT_HEIGHT_PIXELS / 2 - playerPos.y * CELL_SIZE, 0), -(GRID_SIZE * CELL_SIZE - VIEWPORT_HEIGHT_PIXELS));

    return (
        <div className="container-haha alive-game">
            <div
                className="relative overflow-hidden"
                style={{
                    width: VIEWPORT_WIDTH_PIXELS + "px",
                    height: VIEWPORT_HEIGHT_PIXELS + "px",
                    margin: 'auto',
                }}
            >
                <div
                    className="absolute top-0 left-0"
                    style={{
                        width: GRID_SIZE * CELL_SIZE + "px",
                        height: GRID_SIZE * CELL_SIZE + "px",
                        backgroundImage: `url(${gameMapDataUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        transform: `translate(${camX}px, ${camY}px)`,
                        transition: 'transform 0.1s linear',
                    }}
                >
                    {/* Player */}
                    <div
                        className="character"
                        style={{
                            '--x': playerPos.x,
                            '--y': playerPos.y,
                        }}
                        facing={playerFacing}
                        walking={playerWalking.toString()}
                    >
                        <div className="character_spritesheet"></div>
                    </div>

                    {/* NPCs */}
                    {npcs.map((npc) => (
                        <div
                            key={npc.id}
                            className="character npc"
                            style={{
                                '--x': npc.x,
                                '--y': npc.y,
                            }}
                            facing={npc.facing}
                            walking={npc.walking.toString()}
                        >
                            <div className="npc_spritesheet"></div>
                        </div>
                    ))}
                </div>

                {/* Timer */}
                <div
                    className={`absolute top-4 right-4 text-white text-2xl font-bold z-10 ${timeLeft <= 10 ? 'timer-warning' : ''
                        }`}
                >
                    Waktu: {timeLeft} detik
                </div>

                {isGameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-3xl font-bold z-10">
                        <p>{gameMessage}</p>
                        <button
                            onClick={resetGame}
                            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-semibold shadow-md transition-colors"
                        >
                            Main Lagi
                        </button>
                    </div>
                )}

                {isWin && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-3xl font-bold z-10">
                        <p>{gameMessage}</p>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => window.location.href = '../game-map/city'}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xl font-semibold shadow-md transition-colors"
                            >
                                Balik rumah
                            </button>
                            <button
                                onClick={resetGame}
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-semibold shadow-md transition-colors"
                            >
                                Main Lagi
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}