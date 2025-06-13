import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import collision from "../../assets/map/map-collision/map-kamar2";
import cityMape from "../../assets/map/map-image/kamar2.png";
import "../../Citygame.css";
import "../../character-sprites.css";

const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const pixelSize = 1;
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

	if (gridY === 19 && (gridX === 9 || gridX === 10)) {
		return "city";
	}

	return null;
}

// Function to check if position is at mandi spot
function checkMandiPosition(x, y) {
	const gridX = Math.floor(x / 16);
	const gridY = Math.floor(y / 16);
	return gridY === 18 && (gridX === 13 || gridX === 14);
}

// Function to check if position is at food spot
function checkFoodPosition(x, y) {
	const gridX = Math.floor(x / 16);
	const gridY = Math.floor(y / 16);

	return gridY === 9 && gridX >= 1 && gridX <= 7;
}

// Function to check if position is at sleep spot
function checkSleepPosition(x, y) {
	const gridX = Math.floor(x / 16);
	const gridY = Math.floor(y / 16);

	return gridY === 8 && gridX === 15;
}

export default function Beach({
	onChangeWorld,
	startPosition,
	character = "ucup2",
	username = "Player",
	onHygieneIncrease,
	onFullnessIncrease,
	onHappinessIncrease,
	onEnergyIncrease,
	onTimeIncrease,
	onFullnessDecrease,
	onHygieneDecrease,
}) {
	console.log("forest");

	const characterRef = useRef(null);
	const mapRef = useRef(null);
	const [gameState, setGameState] = useState({
		x: startPosition?.x || 4 * 32,
		y: startPosition?.y || 8 * 32,
		pressedDirections: [],
		facing: "down",
		walking: false,
		cameraX: startPosition?.x || 6 * 32,
		cameraY: startPosition?.y || 8 * 32,
	});

	const [showMandiButton, setShowMandiButton] = useState(false);
	const [showFoodButtons, setShowFoodButtons] = useState(false);
	const [showSleepButton, setShowSleepButton] = useState(false);

	const directions = useMemo(
		() => ({
			up: "up",
			down: "down",
			left: "left",
			right: "right",
		}),
		[]
	);

	const keys = useMemo(
		() => ({
			ArrowUp: directions.up,
			ArrowLeft: directions.left,
			ArrowRight: directions.right,
			ArrowDown: directions.down,
		}),
		[directions]
	);

	const speed = 1; // Speed of character movement

	const handleKeyDown = useCallback(
		(e) => {
			const dir = keys[e.code];
			if (dir) {
				setGameState((prev) => {
					if (!prev.pressedDirections.includes(dir)) {
						return {
							...prev,
							pressedDirections: [dir, ...prev.pressedDirections],
						};
					}
					return prev;
				});
			}
		},
		[keys]
	);

	const handleKeyUp = useCallback(
		(e) => {
			const dir = keys[e.code];
			if (dir) {
				setGameState((prev) => ({
					...prev,
					pressedDirections: prev.pressedDirections.filter((d) => d !== dir),
				}));
			}
		},
		[keys]
	);

	useEffect(() => {
		let animationFrameId;

		function lerp(currentValue, destinationValue, time) {
			return currentValue * (1 - time) + destinationValue * time;
		}

		const placeCharacter = () => {
			setGameState((prev) => {
				let { x, y, cameraX, cameraY, pressedDirections, facing, walking } =
					prev;

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

					const feetX = nextX + characterWidth / 2;
					const feetY = nextY + characterHeight;

					// Check if on portal to city
					const portalDestination = checkPortalDestination(feetX, feetY);
					if (portalDestination) {
						if (onChangeWorld) {
							// Send current position and destination
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

				// Check if character is at mandi position
				const feetX = x + 16;
				const feetY = y + 20;
				const gridX = Math.floor(feetX / 16);
				const gridY = Math.floor(feetY / 16);
				console.log(
					`Player at (${x}, ${y}), Feet at (${feetX}, ${feetY}), Grid: (${gridX}, ${gridY})`
				);
				setShowMandiButton(checkMandiPosition(feetX, feetY));
				setShowFoodButtons(checkFoodPosition(feetX, feetY));
				setShowSleepButton(checkSleepPosition(feetX, feetY));

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

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			cancelAnimationFrame(animationFrameId);
		};
	}, [directions, handleKeyDown, handleKeyUp, onChangeWorld]);

	useEffect(() => {
		if (!characterRef.current || !mapRef.current) return;

		const pixelSize = parseInt(
			getComputedStyle(document.documentElement).getPropertyValue(
				"--pixel-size"
			) || "3"
		);

		const CAMERA_LEFT_OFFSET_PX = 206;
		const CAMERA_TOP_OFFSET_PX = 102;

		const cameraTransformLeft =
			-gameState.cameraX * pixelSize + pixelSize * CAMERA_LEFT_OFFSET_PX;
		const cameraTransformTop =
			-gameState.cameraY * pixelSize + pixelSize * CAMERA_TOP_OFFSET_PX;

		mapRef.current.style.transform = `translate3d(${cameraTransformLeft}px, ${cameraTransformTop}px, 0)`;
		characterRef.current.style.transform = `translate3d(${
			gameState.x * pixelSize
		}px, ${gameState.y * pixelSize}px, 0)`;
		characterRef.current.setAttribute("facing", gameState.facing);
		characterRef.current.setAttribute(
			"walking",
			gameState.walking ? "true" : "false"
		);
	}, [gameState]);

	function renderGridCells() {
		const gridCell = 64;
		const cells = [];
		for (let y = 0; y < 20; y++) {
			for (let x = 0; x < 20; x++) {
				cells.push(
					<div
						key={`grid-${x}-${y}`}
						style={{
							position: "absolute",
							left: x * gridCell,
							top: y * gridCell,
							width: gridCell,
							height: gridCell,
							border: "1px solid white",
							boxSizing: "border-box",
							pointerEvents: "none",
							zIndex: 20,
							opacity: 0.5,
							fontSize: 10,
							color: "yellow",
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "flex-start",
							padding: 2,
							background: "transparent",
						}}>
						{y + 1},{x + 1}
					</div>
				);
			}
		}
		return cells;
	}
	return (
		<div className="game-screen">
			<div className="game-container">
				<div className="game-map" ref={mapRef}>
					<img src={cityMape} alt="Map" />
					{/* {renderGridCells()} */}
				</div>
				<div
					ref={characterRef}
					className={`character ${character}`}
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: "32px",
						height: "32px",
					}}
				/>
			</div>
			{showMandiButton && (
				<div className="mandi-button">
					<button
						onClick={() => {
							if (onHygieneIncrease) onHygieneIncrease();
							if (onTimeIncrease) onTimeIncrease();
						}}>
						Mandi
					</button>
				</div>
			)}
			{showFoodButtons && (
				<div className="food-buttons">
					<button
						onClick={() => {
							if (onFullnessIncrease) onFullnessIncrease();
							if (onHappinessIncrease) onHappinessIncrease();
							if (onTimeIncrease) onTimeIncrease();
						}}>
						Makan
					</button>
					<button
						onClick={() => {
							if (onFullnessDecrease) onFullnessDecrease();
							if (onHygieneDecrease) onHygieneDecrease();
							if (onTimeIncrease) onTimeIncrease();
						}}>
						Minum
					</button>
				</div>
			)}
			{showSleepButton && (
				<div className="sleep-button">
					<button
						onClick={() => {
							if (onEnergyIncrease) onEnergyIncrease();
							if (onTimeIncrease) onTimeIncrease();
						}}>
						Tidur
					</button>
				</div>
			)}
		</div>
	);
}
