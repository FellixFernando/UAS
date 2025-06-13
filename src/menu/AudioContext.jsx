import React, {
	createContext,
	useContext,
	useRef,
	useState,
	useEffect,
} from "react";
import bgMusic from "./background-music-main-menu.mp3";

const AudioContext = createContext();

export function useAudio() {
	return useContext(AudioContext);
}

export function AudioProvider({ children }) {
	const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
		const savedMusicState = localStorage.getItem("isMusicPlaying");
		return savedMusicState ? JSON.parse(savedMusicState) : false;
	});
	const audioRef = useRef(null);
	const audioContextRef = useRef(null);

	useEffect(() => { 
		// Initialize audio
		audioRef.current = new Audio(bgMusic);
		audioRef.current.loop = true;
		audioRef.current.volume = 0.2;

		// Try to play music if it was playing before
		if (isMusicPlaying) {
			const tryPlayMusic = async () => {
				try {
					if (!audioContextRef.current) {
						audioContextRef.current = new (window.AudioContext ||
							window.webkitAudioContext)();
					}
					if (audioContextRef.current.state === "suspended") {
						await audioContextRef.current.resume();
					}
					await audioRef.current.play();
				} catch (error) {
					console.log("Could not autoplay music:", error);
				}
			};
			tryPlayMusic();
		}

		// Add event listeners for user interaction
		const handleUserInteraction = () => {
			if (isMusicPlaying && audioRef.current) {
				audioRef.current.play().catch(console.error);
			}
			document.removeEventListener("click", handleUserInteraction);
			document.removeEventListener("keydown", handleUserInteraction);
			document.removeEventListener("touchstart", handleUserInteraction);
		};

		document.addEventListener("click", handleUserInteraction);
		document.addEventListener("keydown", handleUserInteraction);
		document.addEventListener("touchstart", handleUserInteraction);

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
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
		if (!audioRef.current) return;

		try {
			if (isMusicPlaying) {
				audioRef.current.pause();
				setIsMusicPlaying(false);
				localStorage.setItem("isMusicPlaying", "false");
			} else {
				await audioRef.current.play();
				setIsMusicPlaying(true);
				localStorage.setItem("isMusicPlaying", "true");
			}
		} catch (error) {
			console.log("Error toggling music:", error);
		}
	};

	return (
		<AudioContext.Provider value={{ isMusicPlaying, toggleMusic }}>
			{children}
		</AudioContext.Provider>
	);
}
