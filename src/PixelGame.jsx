import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import City from "./game-screen/game-map/city";
import Beach from "./game-screen/game-map/beach";
import Forest from "./game-screen/game-map/forest";
import Cblast from "./game-screen/mini-game/color-blast";
import Triangle from "./game-screen/game-map/triangle";
import Kamar1 from "./game-screen/game-map/kamar1";
import Alive from "./game-screen/mini-game/alive";
import RockClimbing from "./game-screen/mini-game/rock-climbing";
import MainMenu from "./menu/main-menu";
import CharacterSelect from "./menu/character-select";
import { TransitionProvider } from "./menu/TransitionContext";
import PlayerBar from "./game-screen/game-features/player-bar";


import CityTown from "./game-screen/game-map/cityTown";
// import CityNight from "./game-screen/game-map/cityNight";

import "./pixelgame.css";
// import Alive from './game-screen/event/alive';

export default function PixelGame() {
	const [currentWorld, setCurrentWorld] = useState("city");
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
		return (
			<div className="game-screen">
				{/* {currentWorld === 'cityTown' && <CityTown onChangeWorld={handleChangeWorld} />} */}
				{currentWorld === "city" && (
					<City
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
					/>
				)}
				{/* {currentWorld === 'citynight' && <City onChangeWorld={handleChangeWorld} />} */}
				{currentWorld === "beach" && (
					<Beach
						onChangeWorld={handleChangeWorld}
						character={selectedCharacter}
						username={username}
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
				{location.pathname === "/game" && (
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
// // // import CityTown from "./game-screen/game-map/cityTown";
// // // import CityNight from "./game-screen/game-map/cityNight";
// // import Cblast from './game-screen/mini-game/color-blast'
// // // import Triangle from './game-screen/game-map/triangle'
// // import Alive from './game-screen/mini-game/alive'
// import Cblast from "./game-screen/mini-game/color-blast";
// // // import Kamar1 from './game-screen/game-map/kamar1'
// // // import Forest from './game-screen/game-map/forest';

// export default function PixelGame() {
//     return (
//         <div className="frame">
//             <div className="game-screen">
//                 <Cblast/>
//             </div>
//         </div>
//     )
// }
