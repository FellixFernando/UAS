import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTransition } from "./TransitionContext";
import { useAudio } from "./AudioContext";
import pickKarakter from "./pick karakter.png";
import playImg from "./play.png";
import clickSound from "./button-click.mp3";
import ceweGede from "./cewe.jpg"; // Static image for button
import ucup2 from "./ucup.jpg"; // Static image for button
import spritesCewe from "./spritesCewe.png"; // Spritesheet for ceweGede character
import ucup2Sprite from "./ucup2.png"; // Spritesheet for ucup character
import "./character-select.css";

export default function CharacterSelect() {
	const navigate = useNavigate();
	const { triggerTransition } = useTransition();
	const { isMusicPlaying } = useAudio();
	const [selected, setSelected] = useState(null);
	const [username, setUsername] = useState("");

	// New state for animated character display
	const [animatedCharacterSprite, setAnimatedCharacterSprite] = useState(null);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [characterDirection, setCharacterDirection] = useState("right"); // Default direction
	const animationIntervalRef = useRef(null);
	const [characterClass, setCharacterClass] = useState(""); // New state for character specific class

	// Effect for character animation
	useEffect(() => {
		// Clear previous animation interval if it exists
		if (animationIntervalRef.current) {
			clearInterval(animationIntervalRef.current);
		}

		if (selected) {
			// Set the correct sprite and class for the selected character
			if (selected === "ceweGede") {
				setAnimatedCharacterSprite(spritesCewe);
				setCharacterClass("ceweGede-sprite");
			} else if (selected === "ucup2") {
				setAnimatedCharacterSprite(ucup2Sprite);
				setCharacterClass("ucup2-sprite");
			}
			setCurrentFrame(0); // Reset animation frame

			// Start animation
			animationIntervalRef.current = setInterval(() => {
				setCurrentFrame((prevFrame) => (prevFrame + 1) % 4); // Assuming 4 frames for walking
			}, 150); // Adjust speed as needed
		} else {
			setAnimatedCharacterSprite(null); // No character selected, hide animation
			setCharacterClass("");
		}

		return () => {
			// Cleanup animation interval
			if (animationIntervalRef.current) {
				clearInterval(animationIntervalRef.current);
			}
		};
	}, [selected]);

	const handleStartGame = () => {
		const audio = new Audio(clickSound);
		audio.play();
		// Pass selected character and username to the game route
		setTimeout(() => {
			triggerTransition("split_diagonal", 1200, () =>
				navigate("/game", {
					state: { character: selected, username: username },
				})
			);
		}, 250);
	};

	const handleBackToMenu = () => {
		const audio = new Audio(clickSound);
		audio.play();
		setTimeout(() => {
			triggerTransition("split_diagonal", 1200, () => navigate("/"));
		}, 250);
	};

	return (
		<div className="character-select-container">
			{/* Pixel-perfect background image */}
			<img
				src={pickKarakter}
				alt="Character Select Background"
				className="character-select-bg"
				draggable={false}
			/>
			<button className="back-button" onClick={handleBackToMenu}>
				Back to Menu
			</button>
			<h1 className="character-select-title">Select Your Character</h1>
			<div className="username-input-container">
				<label htmlFor="username" className="username-input-label">
					Enter Your Username
				</label>
				<input
					type="text"
					id="username"
					className="username-input"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					maxLength={15}
				/>
			</div>
			<div className="character-select-content">
				<button
					className="play-btn-small"
					onClick={handleStartGame}
					disabled={!selected || !username.trim()}>
					<img src={playImg} alt="Play" />
				</button>
				<div className="character-grid">
					<div className="character-box empty"></div>
					<div className="character-box empty"></div>
					<div className="character-box margin-right">
						<button
							className={`character-button${
								selected === "ceweGede" ? " selected" : ""
							}`}
							onClick={() => setSelected("ceweGede")}>
							<img src={ceweGede} alt="Cewe Gede" />
						</button>
					</div>
					<div className="character-box">
						<button
							className={`character-button${
								selected === "ucup2" ? " selected" : ""
							}`}
							onClick={() => setSelected("ucup2")}>
							<img src={ucup2} alt="Ucup" />
						</button>
					</div>
					<div className="character-box empty"></div>
					<div className="character-box empty"></div>
				</div>
			</div>
			{animatedCharacterSprite && (
				<div
					className={`animated-character-display ${characterClass}`}
					data-direction={characterDirection}
					style={{
						"--sprite-url": `url(${animatedCharacterSprite})`,
						"--frame-position": `-${currentFrame * 96 * 1.5}px`,
					}}
				/>
			)}
		</div>
	);
}
