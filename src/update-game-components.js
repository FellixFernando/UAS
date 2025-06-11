// This is a script to help update all game components
// Copy and paste this into each game component file:

import "../../character-sprites.css";

// Update the component props to include character and username
export default function ComponentName({
	onChangeWorld,
	startPosition,
	character = "ucup2",
	username = "Player",
}) {
	// ... existing code ...

	return (
		<div className="game-container">
			<div className="map-container">
				<div
					ref={mapRef}
					className="map"
					style={{
						backgroundImage: `url(${mapImage})`,
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
						<div className="character_spritesheet" />
					</div>
				</div>
			</div>
			<div className="username-display">{username}</div>
		</div>
	);
}
