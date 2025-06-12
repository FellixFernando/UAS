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

export default function PlayerBar({
	energyLevel = 70,
	fullnessLevel = 70,
	hygieneLevel = 70,
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
				top: 0,
				left: 0,
				right: 0,
				zIndex: 1000,
				padding: "10px 20px",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				pointerEvents: "none",
			}}>
			{/* Left section - Status bars */}
			<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
				{/* Name display */}
				<div
					style={{
						position: "relative",
						width: "200px",
						height: "40px",
						marginRight: "20px",
					}}>
					<img
						src={name}
						alt="Name background"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							color: "white",
							fontSize: "16px",
							fontWeight: "bold",
							textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
						}}>
						{playerName}
					</div>
				</div>

				{/* Status bars */}
				{[
					{ icon: energy, value: energyLevel, color: "#ff5757" },
					{ icon: fullness, value: fullnessLevel, color: "#57ff5e" },
					{ icon: hygiene, value: hygieneLevel, color: "#5797ff" },
				].map((status, index) => (
					<div
						key={index}
						style={{
							position: "relative",
							width: "150px",
							height: "40px",
						}}>
						<img
							src={bgBar}
							alt="Bar background"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "contain",
							}}
						/>
						<div
							style={{
								position: "absolute",
								top: "50%",
								left: "40px",
								right: "10px",
								transform: "translateY(-50%)",
								height: "10px",
								background: "#2a2a2a",
								borderRadius: "7px",
								overflow: "hidden",
							}}>
							<div
								style={{
									width: getBarWidth(status.value),
									height: "100%",
									background: status.color,
									transition: "width 0.3s ease",
								}}
							/>
						</div>
						<img
							src={status.icon}
							alt="Status icon"
							style={{
								position: "absolute",
								left: "5px",
								top: "50%",
								transform: "translateY(-50%)",
								width: "30px",
								height: "30px",
								objectFit: "contain",
							}}
						/>
					</div>
				))}
			</div>

			{/* Right section - Money, Day, and Time */}
			<div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
				{/* Money display */}
				<div
					style={{
						position: "relative",
						width: "150px",
						height: "40px",
					}}>
					<img
						src={bgDuit}
						alt="Money background"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
						}}
					/>
					<img
						src={logoDuit}
						alt="Money icon"
						style={{
							position: "absolute",
							left: "5px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "30px",
							height: "30px",
							objectFit: "contain",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "50%",
							right: "20px",
							transform: "translateY(-50%)",
							color: "white",
							fontSize: "16px",
							fontWeight: "bold",
							textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
						}}>
						${moneyAmount}
					</div>
				</div>

				{/* Day counter */}
				<div
					style={{
						position: "relative",
						width: "100px",
						height: "40px",
					}}>
					<img
						src={bgDay}
						alt="Day background"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
						}}
					/>
					<img
						src={day}
						alt="Day icon"
						style={{
							position: "absolute",
							left: "5px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "30px",
							height: "30px",
							objectFit: "contain",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "50%",
							right: "20px",
							transform: "translateY(-50%)",
							color: "white",
							fontSize: "16px",
							fontWeight: "bold",
							textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
						}}>
						{dayCount}
					</div>
				</div>

				{/* Time display */}
				<div
					style={{
						position: "relative",
						width: "120px",
						height: "40px",
					}}>
					<img
						src={name}
						alt="Time background"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							color: "white",
							fontSize: "16px",
							fontWeight: "bold",
							textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
						}}>
						{formatTime(gameTime.hours)}:{formatTime(gameTime.minutes)}
					</div>
				</div>
			</div>
		</div>
	);
}
