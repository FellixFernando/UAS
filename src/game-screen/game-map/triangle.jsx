import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import collision from "../../assets/map/map-collision/triangleK";
import cityMape from "../../assets/map/map-image/triangleK.png";
import "../../Citygame.css";
import "../../character-sprites.css";
import { items } from "../game-features/items";

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

	const collisionIndex = gridY * MAP_WIDTH + gridX;

	// Only check row 18 (index 17) for portals
	if (gridY === 19 && (gridX === 9 || gridX === 10 || gridX === 11)) {
		return "city";
	}

	return null;
}

export default function Triangle({
	onChangeWorld,
	startPosition,
	character = "ucup2",
	username = "Player",
	onAddToInventory,
	onPartTimeJob,
	moneyAmount,
	setMoneyAmount,
}) {
	console.log("forest");

	const characterRef = useRef(null);
	const mapRef = useRef(null);
	const [gameState, setGameState] = useState({
		x: startPosition?.x || 4.8 * 32,
		y: startPosition?.y || 8.8 * 32,
		pressedDirections: [],
		facing: "down",
		walking: false,
		cameraX: startPosition?.x || 6 * 32,
		cameraY: startPosition?.y || 8 * 32,
	});

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

	const [showFoodButtons, setShowFoodButtons] = useState(false);
	const [showJobOptions, setShowJobOptions] = useState(false);
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptMessage, setPromptMessage] = useState("");

	// Add this function to check if character is at food location
	const checkFoodLocation = useCallback((x, y) => {
		const gridX = Math.floor(x / 16);
		const gridY = Math.floor(y / 16);
		return (gridX === 15 || gridX === 14) && gridY === 12;
	}, []);

	const handleBuyItem = (item, cost) => {
		if (moneyAmount >= cost) {
			setMoneyAmount(moneyAmount - cost);
			onAddToInventory && onAddToInventory(item);
		} else {
			setPromptMessage("Uang tidak cukup!");
			setShowPrompt(true);
		}
	};

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

				// Check if character is at food location
				const feetX = x + 16;
				const feetY = y + 20;
				setShowFoodButtons(checkFoodLocation(feetX, feetY));

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

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			cancelAnimationFrame(animationFrameId);
		};
	}, [
		directions,
		handleKeyDown,
		handleKeyUp,
		onChangeWorld,
		checkFoodLocation,
	]);

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

	// Add food button styles
	const foodButtonStyle = {
		position: "absolute",
		bottom: "20px",
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		gap: "10px",
		zIndex: 1000,
	};

	const buttonStyle = {
		padding: "10px 20px",
		backgroundColor: "#4a4a4a",
		color: "white",
		border: "2px solid #666",
		borderRadius: "4px",
		cursor: "pointer",
		fontFamily: '"Press Start 2P", cursive',
		fontSize: "12px",
		transition: "transform 0.1s",
	};

	return (
		<div className="game-container">
			<div className="map-container">
				<div
					ref={mapRef}
					className="map"
					style={{
						backgroundImage: `url(${cityMape})`,
						transform: `translate3d(${-gameState.cameraX * pixelSize}px, ${
							-gameState.cameraY * pixelSize
						}px, 0)`,
					}}>
					<div
						ref={characterRef}
						className="character"
						data-character={character}
						facing={gameState.facing}
						walking={gameState.walking ? "true" : "false"}>
						<div className="shadow pixel-art"></div>
						<div className="character_spritesheet"></div>
					</div>
				</div>
			</div>
			<div className="username-display">{username}</div>
			{showFoodButtons && (
				<div style={foodButtonStyle}>
					{!showJobOptions ? (
						<>
							<button
								style={buttonStyle}
								onClick={() => handleBuyItem(items.burger, 4)}>
								Burger
							</button>
							<button
								style={buttonStyle}
								onClick={() => handleBuyItem(items.sushi, 3)}>
								Sushi
							</button>
							<button
								style={buttonStyle}
								onClick={() => handleBuyItem(items.airPutih, 2)}>
								Air Putih
							</button>
							<button
								style={buttonStyle}
								onClick={() => setShowJobOptions(true)}>
								Paruh-waktu sebagai kasir
							</button>
						</>
					) : (
						<div style={{ display: "flex", gap: "10px" }}>
							<button
								style={buttonStyle}
								onClick={() => {
									onPartTimeJob && onPartTimeJob(120, 15, 5);
									setShowJobOptions(false);
								}}>
								2 jam
							</button>
							<button
								style={buttonStyle}
								onClick={() => {
									onPartTimeJob && onPartTimeJob(240, 30, 10);
									setShowJobOptions(false);
								}}>
								4 jam
							</button>
							<button
								style={buttonStyle}
								onClick={() => {
									onPartTimeJob && onPartTimeJob(360, 45, 20);
									setShowJobOptions(false);
								}}>
								6 jam
							</button>
						</div>
					)}
				</div>
			)}
			{showPrompt && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0,0,0,0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 2000,
					}}>
					<div
						style={{
							background: "#222",
							color: "white",
							padding: "32px 48px",
							borderRadius: "12px",
							boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
							fontSize: "18px",
							textAlign: "center",
						}}>
						{promptMessage}
						<br />
						<button
							style={{
								marginTop: "18px",
								padding: "8px 24px",
								fontSize: "16px",
								borderRadius: "6px",
								border: "none",
								background: "#4a4a4a",
								color: "white",
								cursor: "pointer",
							}}
							onClick={() => setShowPrompt(false)}>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
