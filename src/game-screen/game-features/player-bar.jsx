import React, { useState, useEffect } from "react";
import bgBar from "../../assets/image/bgBar.png";
import bar from "../../assets/image/bar.png";
import statusBar from "../../assets/image/statusBar.png";
import bgInventory from "../../assets/image/bgInventory.png";
import energy from "../../assets/image/energy.png";
import fullness from "../../assets/image/fullness.png";
import hygiene from "../../assets/image/hygiene.png";
import money from "../../assets/image/money.png";
import logoDuit from "../../assets/image/logoDuit.png";
import day from "../../assets/image/day.png";
import name from "../../assets/image/name.png";
import bgDay from "../../assets/image/bgDay.png";
import bgDuit from "../../assets/image/bgDuit.png";
import hati from "../../assets/image/hati.png";

export default function PlayerBar({
	energyLevel = 70,
	fullnessLevel = 70,
	hygieneLevel = 70,
	happinessLevel = 70,
	moneyAmount = 40,
	dayCount = 1,
	playerName = "Player",
	currentLocation,
}) {
	const [gameTime, setGameTime] = useState({ hours: 6, minutes: 0 });

	useEffect(() => {
		const timer = setInterval(() => {
			setGameTime((prevTime) => {
				let newMinutes = prevTime.minutes + 2;
				let newHours = prevTime.hours;

				if (newMinutes >= 60) {
					newHours += Math.floor(newMinutes / 60);
					newMinutes = newMinutes % 60;
				}

				if (newHours >= 24) {
					newHours = newHours % 24;
				}

				return { hours: newHours, minutes: newMinutes };
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Format time to always show two digits
	const formatTime = (time) => {
		return time.toString().padStart(2, "0");
	};

	// Don't show the bar in these locations
	const hideInLocations = ["rock-climbing", "cblast", "alive"];
	if (hideInLocations.includes(currentLocation)) {
		return null;
	}

	// Convert levels to percentage for bar width
	const getBarWidth = (value) => `${Math.max(0, Math.min(100, value))}%`;

	return (
		<div
			style={{
				position: "fixed",
				top: 16,
				left: 0,
				width: "100vw",
				height: "120px",
				zIndex: 1000,
				pointerEvents: "none",
			}}>
			{/* Main status bar background */}
			<img
				src={statusBar}
				alt="Status Bar Background"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100vw",
					height: "120px",
					objectFit: "cover",
					zIndex: 1,
				}}
			/>

			{/* Name/portrait area (left) */}
			<div
				style={{
					position: "absolute",
					top: 18,
					left: 32,
					width: 120,
					height: 48,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 2,
				}}>
				<span
					style={{
						color: "#fff",
						fontWeight: "bold",
						fontSize: 18,
						textShadow: "2px 2px 2px #0008",
					}}>
					{playerName}
				</span>
			</div>

			{/* Clock (bottom left) */}
			<div
				style={{
					position: "absolute",
					bottom: 8,
					left: 38,
					width: 60,
					height: 28,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 2,
				}}>
				<span
					style={{
						color: "#fff",
						fontWeight: "bold",
						fontSize: 16,
						textShadow: "2px 2px 2px #0008",
					}}>
					{formatTime(gameTime.hours)}:{formatTime(gameTime.minutes)}
				</span>
			</div>

			{/* Status bars (top row) */}
			{/* Energy */}
			<div
				style={{
					position: "absolute",
					top: 24,
					left: 180,
					width: 260,
					height: 32,
					zIndex: 2,
				}}>
				<img
					src={energy}
					alt="Energy"
					style={{
						position: "absolute",
						left: 0,
						top: 2,
						width: 28,
						height: 28,
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 38,
						top: 12,
						width: 200,
						height: 10,
						background: "#2a2a2a",
						borderRadius: 7,
						overflow: "hidden",
					}}>
					<div
						style={{
							width: getBarWidth(energyLevel),
							height: "100%",
							background: "#ff5757",
							transition: "width 0.3s",
						}}
					/>
				</div>
			</div>
			{/* Happiness */}
			<div
				style={{
					position: "absolute",
					top: 24,
					left: 470,
					width: 260,
					height: 32,
					zIndex: 2,
				}}>
				<img
					src={hati}
					alt="Happiness"
					style={{
						position: "absolute",
						left: 0,
						top: 2,
						width: 28,
						height: 28,
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 38,
						top: 12,
						width: 200,
						height: 10,
						background: "#2a2a2a",
						borderRadius: 7,
						overflow: "hidden",
					}}>
					<div
						style={{
							width: getBarWidth(happinessLevel),
							height: "100%",
							background: "#FEC417",
							transition: "width 0.3s",
						}}
					/>
				</div>
			</div>
			{/* Fullness */}
			<div
				style={{
					position: "absolute",
					top: 24,
					left: 760,
					width: 260,
					height: 32,
					zIndex: 2,
				}}>
				<img
					src={fullness}
					alt="Fullness"
					style={{
						position: "absolute",
						left: 0,
						top: 2,
						width: 28,
						height: 28,
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 38,
						top: 12,
						width: 200,
						height: 10,
						background: "#2a2a2a",
						borderRadius: 7,
						overflow: "hidden",
					}}>
					<div
						style={{
							width: getBarWidth(fullnessLevel),
							height: "100%",
							background: "#57ff5e",
							transition: "width 0.3s",
						}}
					/>
				</div>
			</div>
			{/* Hygiene */}
			<div
				style={{
					position: "absolute",
					top: 24,
					left: 1050,
					width: 260,
					height: 32,
					zIndex: 2,
				}}>
				<img
					src={hygiene}
					alt="Hygiene"
					style={{
						position: "absolute",
						left: 0,
						top: 2,
						width: 28,
						height: 28,
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 38,
						top: 12,
						width: 200,
						height: 10,
						background: "#2a2a2a",
						borderRadius: 7,
						overflow: "hidden",
					}}>
					<div
						style={{
							width: getBarWidth(hygieneLevel),
							height: "100%",
							background: "#5797ff",
							transition: "width 0.3s",
						}}
					/>
				</div>
			</div>

			{/* Money (right slot) */}
			<div
				style={{
					position: "absolute",
					top: 60,
					right: 90,
					width: 120,
					height: 36,
					zIndex: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
				}}>
				<img
					src={logoDuit}
					alt="Money icon"
					style={{ width: 28, height: 28, marginRight: 8 }}
				/>
				<span
					style={{
						color: "#fff",
						fontWeight: "bold",
						fontSize: 18,
						textShadow: "2px 2px 2px #0008",
					}}>
					${moneyAmount}
				</span>
			</div>
		</div>
	);
}
