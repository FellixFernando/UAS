import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AudioProvider } from "./menu/AudioContext";
import City from "./game-screen/game-map/city";
import Beach from "./game-screen/game-map/beach";
import Forest from "./game-screen/game-map/forest";
import Cblast from "./game-screen/mini-game/color-blast";
import Triangle from "./game-screen/game-map/triangle";
import Kamar1 from "./game-screen/game-map/kamar1";
import Alive from "./game-screen/mini-game/alive";
import GedungSeni from "./game-screen/game-map/gedungSeni";
import RockClimbing from "./game-screen/mini-game/rock-climbing";
import TicTacToe from "./game-screen/mini-game/tic-tac-toe";
import MainMenu from "./menu/main-menu";
import CharacterSelect from "./menu/character-select";
import { TransitionProvider } from "./menu/TransitionContext";
import PlayerBar from "./game-screen/game-features/player-bar";
import GameOverOverlay from "./game-screen/game-features/game-over-overlay";
import Inventory from "./game-screen/game-features/inventory";

// import CityTown from "./game-screen/game-map/cityTown";
// import CityNight from "./game-screen/game-map/cityNight";

import "./pixelGame.css";
// import Alive from './game-screen/event/alive';

export default function PixelGame() {
	const [currentWorld, setCurrentWorld] = useState("tictactoe"); // Set initial world to tictactoe
	const location = useLocation();
	const selectedCharacter = location.state?.character || "ucup2";
	const username = location.state?.username || "Player";

	// Player stats
	const [energyLevel, setEnergyLevel] = useState(70);
	const [fullnessLevel, setFullnessLevel] = useState(70);
	const [hygieneLevel, setHygieneLevel] = useState(70);
	const [happinessLevel, setHappinessLevel] = useState(70);
	const [moneyAmount, setMoneyAmount] = useState(10);
	const [dayCount, setDayCount] = useState(1);
	const [gameOver, setGameOver] = useState(false);
	const [gameOverReason, setGameOverReason] = useState(null);

	// Inventory system
	const [inventory, setInventory] = useState(Array(12).fill(null));
	const [showInventory, setShowInventory] = useState(false);

	// Add timer state
	const [timer, setTimer] = useState(0);

	const addToInventory = (item) => {
		setInventory((prevInventory) => {
			const newInventory = [...prevInventory];
			const existingItemIndex = newInventory.findIndex(
				(invItem) => invItem && invItem.id === item.id
			);

			if (existingItemIndex !== -1) {
				// If item exists, increase quantity
				newInventory[existingItemIndex] = {
					...newInventory[existingItemIndex],
					quantity: newInventory[existingItemIndex].quantity + 1,
				};
			} else {
				// Find first empty slot
				const emptySlotIndex = newInventory.findIndex((slot) => slot === null);
				if (emptySlotIndex !== -1) {
					newInventory[emptySlotIndex] = { ...item, quantity: 1 };
				}
			}
			return newInventory;
		});
	};

	const useItem = (item) => {
		if (!item) return;

		// Apply item effects
		switch (item.type) {
			case "food":
				setFullnessLevel((prev) => Math.min(100, prev + item.effect));
				// If burger or sushi, also increase happiness and decrease hygiene
				if (item.id === "burger" || item.id === "sushi") {
					setHappinessLevel((prev) => Math.min(100, prev + 10));
					setHygieneLevel((prev) => Math.max(0, prev - 5));
				}
				break;
			case "energy":
				setEnergyLevel((prev) => Math.min(100, prev + item.effect));
				break;
			case "hygiene":
				setHygieneLevel((prev) => Math.min(100, prev + item.effect));
				break;
			case "happiness":
				setHappinessLevel((prev) => Math.min(100, prev + item.effect));
				break;
			default:
				break;
		}

		// Remove item from inventory
		setInventory((prevInventory) => {
			const newInventory = [...prevInventory];
			const itemIndex = newInventory.findIndex(
				(invItem) => invItem && invItem.id === item.id
			);

			if (itemIndex !== -1) {
				if (newInventory[itemIndex].quantity > 1) {
					newInventory[itemIndex] = {
						...newInventory[itemIndex],
						quantity: newInventory[itemIndex].quantity - 1,
					};
				} else {
					newInventory[itemIndex] = null;
				}
			}
			return newInventory;
		});
	};

	// Toggle inventory visibility with 'I' key
	useEffect(() => {
		const handleKeyPress = (event) => {
			if (event.key.toLowerCase() === "i") {
				setShowInventory((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	const resetGame = () => {
		setGameOver(false);
		setGameOverReason(null);
		setEnergyLevel(70);
		setFullnessLevel(70);
		setHygieneLevel(70);
		setHappinessLevel(70);
		setMoneyAmount(10);
		setDayCount(1);
	};

	// Check for game over conditions
	useEffect(() => {
		// Check if any status is 0
		if (
			energyLevel <= 0 ||
			fullnessLevel <= 0 ||
			hygieneLevel <= 0 ||
			happinessLevel <= 0
		) {
			setGameOver(true);
			setGameOverReason("status");
			return;
		}

		// Check if 2 or more statuses are below 10
		const lowStatuses = [
			energyLevel < 10,
			fullnessLevel < 10,
			hygieneLevel < 10,
			happinessLevel < 10,
		].filter(Boolean).length;

		if (lowStatuses >= 2) {
			setGameOver(true);
			setGameOverReason("status");
			return;
		}

		// Check if day count exceeds 7
		if (dayCount > 7) {
			setGameOver(true);
			setGameOverReason("day");
			return;
		}
	}, [energyLevel, fullnessLevel, hygieneLevel, happinessLevel, dayCount]);

	// Ubah handleChangeWorld agar bisa menerima posisi (opsional untuk kasus ini)
	const handleChangeWorld = (newWorld, startPos) => {
		// startPos bersifat opsional di sini
		// if (newWorld === 'beach' && startPos) { // Logika ini bisa disederhanakan jika startPos tidak digunakan untuk portal ini
		//     setBeachStart(startPos);
		// }
		console.log(`Mengubah dunia ke: ${newWorld}`); // Untuk debugging
		setCurrentWorld(newWorld);
	};

	// Handler for part-time job
	const handlePartTimeJob = (minutes, statDecrease, moneyIncrease) => {
		setTimer((prev) => prev + minutes);
		setEnergyLevel((prev) => Math.max(0, prev - statDecrease));
		setFullnessLevel((prev) => Math.max(0, prev - statDecrease));
		setHygieneLevel((prev) => Math.max(0, prev - statDecrease));
		setHappinessLevel((prev) => Math.max(0, prev - statDecrease));
		setMoneyAmount((prev) => prev + moneyIncrease);
	};

	const GameContent = () => {
		if (currentWorld === "tictactoe") {
			return <TicTacToe onChangeWorld={handleChangeWorld} />;
		}

		return (
			<div className="game-screen">
				{currentWorld === "city" && (
					<City
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{currentWorld === "beach" && (
					<Beach
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{currentWorld === "gedungSeni" && (
					<GedungSeni
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
						onFullnessIncrease={(amount) => {
							setFullnessLevel((prev) => Math.min(100, prev + amount));
						}}
						onEnergyIncrease={(amount) => {
							setEnergyLevel((prev) => Math.min(100, prev + amount));
						}}
						onHappinessIncrease={(amount) => {
							setHappinessLevel((prev) => Math.min(100, prev + amount));
						}}
					/>
				)}

				{currentWorld === "forest" && (
					<Forest
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{currentWorld === "cblast" && (
					<Cblast
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{currentWorld === "triangle" && (
					<Triangle
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
						onAddToInventory={addToInventory}
						onPartTimeJob={handlePartTimeJob}
						moneyAmount={moneyAmount}
						setMoneyAmount={setMoneyAmount}
					/>
				)}
				{currentWorld === "kamar1" && (
					<Kamar1
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
						onHygieneIncrease={(amount) => {
							setHygieneLevel((prev) => Math.min(100, prev + amount));
						}}
						onFullnessIncrease={(amount) => {
							setFullnessLevel((prev) => Math.min(100, prev + amount));
						}}
						onHappinessIncrease={(amount) => {
							setHappinessLevel((prev) => Math.min(100, prev + amount));
						}}
						onEnergyIncrease={(amount) => {
							setEnergyLevel((prev) => Math.min(100, prev + amount));
						}}
						onTimeIncrease={(minutes) => {
							// Add 480 minutes (8 hours) to the time
							setDayCount((prev) => prev + 1);
						}}
						onFullnessDecrease={(amount) => {
							setFullnessLevel((prev) => Math.max(0, prev - amount));
						}}
						onHygieneDecrease={(amount) => {
							setHygieneLevel((prev) => Math.max(0, prev - amount));
						}}
					/>
				)}
				{currentWorld === "alive" && (
					<Alive
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{currentWorld === "rock-climbing" && (
					<RockClimbing
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{showInventory && <Inventory items={inventory} onUseItem={useItem} />}
			</div>
		);
	};

	return (
		<AudioProvider>
			<TransitionProvider>
				<div className="frame">
					{" "}
					{location.pathname === "/game" && currentWorld !== "tictactoe" && (
						<PlayerBar
							energyLevel={energyLevel}
							fullnessLevel={fullnessLevel}
							hygieneLevel={hygieneLevel}
							happinessLevel={happinessLevel}
							moneyAmount={moneyAmount}
							dayCount={dayCount}
							playerName={username}
							currentLocation={currentWorld}
						/>
					)}
					<Routes>
						<Route path="/" element={<MainMenu />} />
						<Route path="/character-select" element={<CharacterSelect />} />
						<Route path="/game" element={<GameContent />} />
					</Routes>
					{gameOver && (
						<GameOverOverlay reason={gameOverReason} onReset={resetGame} />
					)}
				</div>
			</TransitionProvider>
		</AudioProvider>
	);
}

// import { useState } from "react";
// import CityTown from "./game-screen/game-map/cityTown";
// import CityNight from "./game-screen/game-map/cityNight";
// import Cblast from './game-screen/mini-game/color-blast'
// import Triangle from './game-screen/game-map/triangle'
// import Alive from './game-screen/mini-game/alive'
// import Cblast from "./game-screen/mini-game/color-blast";
// import Kamar1 from './game-screen/game-map/kamar1'
// import Forest from './game-screen/game-map/forest';
// import TicTacToe  from "./game-screen/mini-game/tic-tac-toe";
// import GedungSeni from "./game-screen/game-map/gedung-seni";
// import Beach from "./game-screen/game-map/beach";

// export default function PixelGame() {
//     return (
//         <Beach/>
//     )
// }
