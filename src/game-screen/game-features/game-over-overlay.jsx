import React from "react";
import { useNavigate } from "react-router-dom";

export default function GameOverOverlay({ reason, onReset }) {
	const navigate = useNavigate();

	const handleReturnToMenu = () => {
		onReset();
		navigate("/");
	};

	const getGameOverMessage = () => {
		if (reason === "day") {
			return "Your vacation has ended!";
		} else if (reason === "status") {
			return "Your character's condition is too poor to continue!";
		}
		return "Game Over!";
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 9999,
				color: "#fff",
				fontFamily: '"Press Start 2P", monospace',
			}}>
			<h1
				style={{
					fontSize: "2.5rem",
					marginBottom: "2rem",
					color: "#ff4444",
					textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
				}}>
				{getGameOverMessage()}
			</h1>
			<p
				style={{
					fontSize: "1.2rem",
					marginBottom: "2rem",
					textAlign: "center",
					maxWidth: "600px",
					lineHeight: "1.5",
				}}>
				{reason === "day"
					? "You've completed your 7-day vacation in Bali!"
					: "Make sure to take better care of your character next time!"}
			</p>
			<button
				onClick={handleReturnToMenu}
				style={{
					padding: "15px 30px",
					backgroundColor: "#f3e5c2",
					color: "#b48a6d",
					border: "4px solid #e7cfa0",
					borderRadius: "8px",
					boxShadow: "0 4px 0 #b48a6d",
					cursor: "pointer",
					fontSize: "1.2rem",
					fontFamily: '"Press Start 2P", monospace',
					textShadow: "2px 2px 0 #b48a6d",
					transition: "transform 0.2s ease",
				}}
				onMouseOver={(e) => {
					e.target.style.transform = "scale(1.05)";
				}}
				onMouseOut={(e) => {
					e.target.style.transform = "scale(1)";
				}}>
				Return to Main Menu
			</button>
		</div>
	);
}
