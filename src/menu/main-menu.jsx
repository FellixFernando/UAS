import { useNavigate } from "react-router-dom";
import { useTransition } from "./TransitionContext";
import { useAudio } from "./AudioContext";
import { useEffect, useRef, useState } from "react";
import mainMenuBg from "./mainMenu.png";
import playImg from "./play.png";
import blankButtonImg from "./blank-button.png";
import clickSound from "./button-click.mp3";
import bgMusic from "./background-music-main-menu.mp3";
import papanImg from "./papan.png";
import claresImg from "./clares.jpg";
import rorenImg from "./roren.jpg";
import hansenImg from "./hansen.jpg";
import fellixImg from "./fellix.jpg";
import logoumnImg from "./logoumn.png";
import "./main-menu.css";

export default function MainMenu() {
	const navigate = useNavigate();
	const { triggerTransition } = useTransition();
	const { isMusicPlaying, toggleMusic } = useAudio();
	const bgMusicRef = useRef(null);
	const audioContextRef = useRef(null);
	const [showMakers, setShowMakers] = useState(false);

	// Function to try playing music
	const tryPlayMusic = async () => {
		if (!bgMusicRef.current || isMusicPlaying) return;

		try {
			// Try to create and resume AudioContext if it doesn't exist
			if (!audioContextRef.current) {
				audioContextRef.current = new (window.AudioContext ||
					window.webkitAudioContext)();
			}
			if (audioContextRef.current.state === "suspended") {
				await audioContextRef.current.resume();
			}

			// Try to play the music
			await bgMusicRef.current.play();
		} catch (error) {
			console.log("Could not autoplay music:", error);
			// If autoplay fails, we'll keep the music button visible for manual play
		}
	};

	// Set up audio on component mount
	useEffect(() => {
		// Create and configure background music
		bgMusicRef.current = new Audio(bgMusic);
		bgMusicRef.current.loop = true;
		bgMusicRef.current.volume = 0.5;

		// Try to play music immediately
		tryPlayMusic();

		// Cleanup function
		return () => {
			if (bgMusicRef.current) {
				bgMusicRef.current.pause();
				bgMusicRef.current.currentTime = 0;
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
		};
	}, []);

	const handleStartGame = () => {
		const audio = new Audio(clickSound);
		audio.play();
		setTimeout(() => {
			triggerTransition("split_diagonal", 1200, () =>
				navigate("/character-select")
			);
		}, 250);
	};

	return (
		<div
			className="menu-container"
			style={{ backgroundImage: `url(${mainMenuBg})` }}>
			<div className="menu-title-wrapper">
				<img src={papanImg} alt="Papan" className="papan-bg" />
				<h1 className="menu-title">
					Tropical <br /> <span className="menu-title-second">Trouble</span>
				</h1>
				<button
					className="makers-btn"
					aria-label="Meet The Makers"
					onClick={() => setShowMakers(true)}>
					<img src={blankButtonImg} alt="Meet The Makers!" />
					<span className="makers-btn-text">Meet The Makers!</span>
				</button>
			</div>
			<button
				onClick={handleStartGame}
				className="play-btn"
				aria-label="Start Game">
				<img src={playImg} alt="Play" />
			</button>
			<button
				onClick={toggleMusic}
				className="music-btn"
				aria-label={isMusicPlaying ? "Pause Music" : "Play Music"}>
				{isMusicPlaying ? "🔊" : "🔈"}
			</button>

			{showMakers && (
				<div className="makers-modal">
					<div className="makers-modal-content">
						<button
							className="makers-modal-close"
							onClick={() => setShowMakers(false)}>
							&times;
						</button>
						<div className="makers-modal-header">
							Hello, we are{" "}
							<span style={{ color: "#d32f2f", fontWeight: "bold" }}>
								pyThoink!
							</span>
						</div>
						<div className="makers-modal-grid">
							<div className="maker-item">
								<div className="maker-pic">
									<img src={claresImg} alt="Clares" />
								</div>
								<div className="maker-text">Jesslyn Claresta</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">
									<img src={rorenImg} alt="Roren" />
								</div>
								<div className="maker-text">Rorensia Verisca</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">
									<img src={hansenImg} alt="Hansen" />
								</div>
								<div className="maker-text">Hansen Japri</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">
									<img src={fellixImg} alt="Fellix" />
								</div>
								<div className="maker-text">Fellix Fernando</div>
							</div>
							<div className="maker-item center">
								<div className="maker-pic">
									<img src={logoumnImg} alt="Logo UMN" />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
