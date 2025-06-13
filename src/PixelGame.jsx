import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

	// Ubah handleChangeWorld agar bisa menerima posisi (opsional untuk kasus ini)
	const handleChangeWorld = (newWorld, startPos) => {
		// startPos bersifat opsional di sini
		// if (newWorld === 'beach' && startPos) { // Logika ini bisa disederhanakan jika startPos tidak digunakan untuk portal ini
		//     setBeachStart(startPos);
		// }
		console.log(`Mengubah dunia ke: ${newWorld}`); // Untuk debugging
		setCurrentWorld(newWorld);
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
			</div>
		);
	};

	return (
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
			</div>
		</TransitionProvider>
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
