import { useNavigate } from "react-router-dom";
import { useTransition } from "./TransitionContext";
import { useEffect, useRef, useState } from "react";
import mainMenuBg from "./mainMenu.png";
import playImg from "./play.png";
import blankButtonImg from "./blank-button.png";
import clickSound from "./button-click.mp3";
import bgMusic from "./background-music-main-menu.mp3";
import papanImg from "./papan.png";
import "./main-menu.css";

export default function MainMenu() {
	const navigate = useNavigate();
	const { triggerTransition } = useTransition();
	const bgMusicRef = useRef(null);
	const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
		const savedMusicState = localStorage.getItem("isMusicPlaying");
		return savedMusicState ? JSON.parse(savedMusicState) : false;
	});
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
			setIsMusicPlaying(true);
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

		// Also try to play on any user interaction with the document
		const handleUserInteraction = () => {
			tryPlayMusic();
			// Remove the event listeners after first successful interaction
			document.removeEventListener("click", handleUserInteraction);
			document.removeEventListener("keydown", handleUserInteraction);
			document.removeEventListener("touchstart", handleUserInteraction);
		};

		// Add event listeners for user interaction
		document.addEventListener("click", handleUserInteraction);
		document.addEventListener("keydown", handleUserInteraction);
		document.addEventListener("touchstart", handleUserInteraction);

		// Cleanup function
		return () => {
			if (bgMusicRef.current) {
				bgMusicRef.current.pause();
				bgMusicRef.current.currentTime = 0;
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
			document.removeEventListener("click", handleUserInteraction);
			document.removeEventListener("keydown", handleUserInteraction);
			document.removeEventListener("touchstart", handleUserInteraction);
		};
	}, []);

	const toggleMusic = async () => {
		if (!bgMusicRef.current) return;

		try {
			if (isMusicPlaying) {
				bgMusicRef.current.pause();
				setIsMusicPlaying(false);
				localStorage.setItem("isMusicPlaying", "false");
			} else {
				await bgMusicRef.current.play();
				setIsMusicPlaying(true);
				localStorage.setItem("isMusicPlaying", "true");
			}
		} catch (error) {
			console.log("Error toggling music:", error);
		}
	};

	const handleStartGame = () => {
		const audio = new Audio(clickSound);
		audio.play();
		if (bgMusicRef.current) {
			bgMusicRef.current.pause();
			bgMusicRef.current.currentTime = 0;
		}
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
								<div className="maker-pic">PICTURE 1</div>
								<div className="maker-text">TEXT 1</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">PICTURE 2</div>
								<div className="maker-text">TEXT 2</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">PICTURE 3</div>
								<div className="maker-text">TEXT 3</div>
							</div>
							<div className="maker-item">
								<div className="maker-pic">PICTURE 4</div>
								<div className="maker-text">TEXT 4</div>
							</div>
							<div className="maker-item center">
								<div className="maker-pic">PICTURE 5</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
