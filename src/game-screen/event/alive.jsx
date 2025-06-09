import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import collision from '../../assets/map/map-collision/alives';
import aliveMape from '../../assets/map/map-image/itsalive.png';
import '../../alive.css';

const MAP_WIDTH = 60;
const MAP_HEIGHT = 60;

function isCollision(x, y) {
    const gridX = Math.floor(x / 16);
    const gridY = Math.floor(y / 16);

    if (gridX < 0 || gridX >= MAP_WIDTH || gridY < 0 || gridY >= MAP_HEIGHT) {
        return true; // Out of bounds = collision
    }

    const collisionValue = collision[gridY * MAP_WIDTH + gridX];
    return collisionValue !== 0 && collisionValue !== -1; // Anything besides 0 and -1 is collision
}

// Function to check if position is a portal back to city
function checkPortalDestination(x, y) {
    const gridX = Math.floor(x / 16);
    const gridY = Math.floor(y / 16);

    if (gridX < 0 || gridX >= MAP_WIDTH || gridY < 0 || gridY >= MAP_HEIGHT) {
        return null;
    }

    // // Baris ke-20 kolom ke-9 (ingat index 0)
    // if (gridY === 19 && gridX === 8) {
    //     return 'city';
    // }

    // // Baris ke-6 kolom ke-3 atau ke-4
    // if (gridY === 5 && (gridX === 2 || gridX === 3)) {
    //     return 'cblast';
    // }

    return null;
}

export default function Alive({ onChangeWorld, startPosition }) {
    console.log('alive');

    const characterRef = useRef(null);
    const mapRef = useRef(null);
    const [gameState, setGameState] = useState({
        x: startPosition?.x || 7.2 * 32,
        y: startPosition?.y || 6 * 32,
        pressedDirections: [],
        facing: "down",
        walking: false,
        cameraX: startPosition?.x || 7.2 * 32,
        cameraY: startPosition?.y || 8 * 32,
    });

    // Add NPC state
    const [npcState, setNpcState] = useState({
        x: 10 * 32, // Initial NPC X position
        y: 10 * 32, // Initial NPC Y position 
        facing: "down"
    });

    // Add game over state
    const [isGameOver, setIsGameOver] = useState(false);

    const directions = useMemo(() => ({
        up: "up",
        down: "down",
        left: "left",
        right: "right",
    }), []);

    const keys = useMemo(() => ({
        'ArrowUp': directions.up,
        'ArrowLeft': directions.left,
        'ArrowRight': directions.right,
        'ArrowDown': directions.down,
    }), [directions]);

    const speed = 1; // Speed of character movement

    const handleKeyDown = useCallback((e) => {
        const dir = keys[e.code];
        if (dir) {
            setGameState(prev => {
                if (!prev.pressedDirections.includes(dir)) {
                    return {
                        ...prev,
                        pressedDirections: [dir, ...prev.pressedDirections],
                    };
                }
                return prev;
            });
        }
    }, [keys]);

    const handleKeyUp = useCallback((e) => {
        const dir = keys[e.code];
        if (dir) {
            setGameState(prev => ({
                ...prev,
                pressedDirections: prev.pressedDirections.filter(d => d !== dir),
            }));
        }
    }, [keys]);

    useEffect(() => {
        let animationFrameId;

        function lerp(currentValue, destinationValue, time) {
            return currentValue * (1 - time) + destinationValue * time;
        }

        const placeCharacter = () => {
            setGameState(prev => {
                let { x, y, cameraX, cameraY, pressedDirections, facing, walking } = prev;

                const direction = pressedDirections[0];
                walking = false;

                if (direction) {
                    let nextX = x;
                    let nextY = y;

                    // Calculate next position based on direction
                    if (direction === directions.right) nextX += speed;
                    if (direction === directions.left) nextX -= speed;
                    if (direction === directions.down) nextY += speed;
                    if (direction === directions.up) nextY -= speed;

                    // Check for collision before moving
                    const characterWidth = 32;
                    const characterHeight = 20;

                    const feetX = nextX + (characterWidth / 2);
                    const feetY = nextY + characterHeight;

                    // Check if on portal to city
                    const portalDestination = checkPortalDestination(feetX, feetY);
                    if (portalDestination) {
                        if (onChangeWorld) {
                            onChangeWorld(portalDestination, nextX, nextY);
                        }
                        return {
                            ...prev,
                            x: nextX,
                            y: nextY,
                            walking: true,
                            facing: direction,
                        };
                    }                   
                    if (!isCollision(feetX, feetY)) {
                        x = nextX;
                        y = nextY;
                        walking = true;
                    }

                    facing = direction;


                }

                // Camera logic
                const LOOKAHEAD_DISTANCE = 6;
                let lookaheadX = 0;
                let lookaheadY = 0;

                if (direction === directions.left) lookaheadX -= LOOKAHEAD_DISTANCE;
                if (direction === directions.right) lookaheadX += LOOKAHEAD_DISTANCE;
                if (direction === directions.up) lookaheadY -= LOOKAHEAD_DISTANCE;
                if (direction === directions.down) lookaheadY += LOOKAHEAD_DISTANCE;

                const cameraDstX = x + lookaheadX;
                const cameraDstY = y + lookaheadY;

                const lerpSpeed = 0.1;
                const newCameraX = lerp(cameraX, cameraDstX, lerpSpeed);
                const newCameraY = lerp(cameraY, cameraDstY, lerpSpeed);

                return {
                    x,
                    y,
                    cameraX: newCameraX,
                    cameraY: newCameraY,
                    pressedDirections,
                    facing,
                    walking,
                };
            });
        };

        const tick = () => {
            placeCharacter();
            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [directions, handleKeyDown, handleKeyUp, onChangeWorld]);

    useEffect(() => {
        if (!characterRef.current || !mapRef.current) return;

        const pixelSize = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--pixel-size') || '3'
        );

        const CAMERA_LEFT_OFFSET_PX = 206;
        const CAMERA_TOP_OFFSET_PX = 102;

        const cameraTransformLeft = -gameState.cameraX * pixelSize + (pixelSize * CAMERA_LEFT_OFFSET_PX);
        const cameraTransformTop = -gameState.cameraY * pixelSize + (pixelSize * CAMERA_TOP_OFFSET_PX);

        mapRef.current.style.transform = `translate3d(${cameraTransformLeft}px, ${cameraTransformTop}px, 0)`;
        characterRef.current.style.transform = `translate3d(${gameState.x * pixelSize}px, ${gameState.y * pixelSize}px, 0)`;
        characterRef.current.setAttribute('facing', gameState.facing);
        characterRef.current.setAttribute('walking', gameState.walking ? 'true' : 'false');
    }, [gameState]);

    // Add NPC movement effect
    useEffect(() => {
        if (isGameOver) return;

        const moveNpc = () => {
            setNpcState(prevNpc => {
                let newX = prevNpc.x;
                let newY = prevNpc.y;
                
                // Move NPC towards player
                const speed = 0.7; // Adjust speed as needed
                
                // Calculate direction to player
                if (Math.abs(gameState.x - prevNpc.x) > speed) {
                    newX += (gameState.x > prevNpc.x) ? speed : -speed;
                }
                if (Math.abs(gameState.y - prevNpc.y) > speed) {
                    newY += (gameState.y > prevNpc.y) ? speed : -speed;
                }

                // Update NPC facing direction
                let facing = prevNpc.facing;
                if (Math.abs(gameState.x - prevNpc.x) > Math.abs(gameState.y - prevNpc.y)) {
                    facing = gameState.x > prevNpc.x ? "right" : "left";
                } else {
                    facing = gameState.y > prevNpc.y ? "down" : "up";
                }

                // Check for collision before moving
                const npcFeetX = newX + 16; // Half character width
                const npcFeetY = newY + 20; // Character height

                if (!isCollision(npcFeetX, npcFeetY)) {
                    return { x: newX, y: newY, facing };
                }
                return prevNpc;
            });
        };

        const npcInterval = setInterval(moveNpc, 50);
        return () => clearInterval(npcInterval);
    }, [gameState.x, gameState.y, isGameOver]);

    // Add collision check between player and NPC
    useEffect(() => {
        const checkCollision = () => {
            const distance = Math.sqrt(
                Math.pow(gameState.x - npcState.x, 2) + 
                Math.pow(gameState.y - npcState.y, 2)
            );
            
            // If NPC is within 20 pixels of player
            if (distance < 20) {
                setIsGameOver(true);
            }
        };

        if (!isGameOver) {
            checkCollision();
        }
    }, [gameState.x, gameState.y, npcState.x, npcState.y, isGameOver]);

    function renderGridCells() {
        const gridCell = 64;
        const cells = [];
        for (let y = 0; y < 60; y++) {
            for (let x = 0; x < 60; x++) {
                cells.push(
                    <div
                        key={`grid-${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: x * gridCell,
                            top: y * gridCell,
                            width: gridCell,
                            height: gridCell,
                            border: '1px solid white',
                            boxSizing: 'border-box',
                            pointerEvents: 'none',
                            zIndex: 60,
                            opacity: 0.5,
                            fontSize: 10,
                            color: 'yellow',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            padding: 2,
                            background: 'transparent',
                        }}
                    >
                        {y + 1},{x + 1}
                    </div>
                );
            }
        }
        return cells;
    }
    return (
        <div className="game-screen">
            <div ref={mapRef} className="map" style={{ backgroundImage: `url(${aliveMape})` }}>
                {/* Game over overlay */}
                {isGameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '32px',
                        zIndex: 100
                    }}>
                        Game Over! NPC Caught You!
                    </div>
                )}

                {/* Player character */}
                <div
                    ref={characterRef}
                    className="character"
                    facing={gameState.facing}
                    walking={gameState.walking.toString()}
                >
                    <div className="shadow pixel-art"></div>
                    <div className="character_spritesheet"></div>
                </div>

                {/* NPC character */}
                <div
                    className="character"
                    style={{
                        transform: `translate3d(${npcState.x}px, ${npcState.y}px, 0)`,
                        filter: 'hue-rotate(120deg)'
                    }}
                    facing={npcState.facing}
                    walking="true"
                >
                    <div className="shadow pixel-art"></div>
                    <div className="character_spritesheet"></div>
                </div>
            </div>
        </div>
    );
}