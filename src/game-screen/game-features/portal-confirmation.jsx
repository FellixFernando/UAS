import React, { useEffect } from "react";

export default function PortalConfirmation({ targetMap, onConfirm, onCancel }) {
	useEffect(() => {
		const handleKeyPress = (e) => {
			if (e.key.toLowerCase() === "e") {
				onConfirm();
			} else {
				onCancel();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [onConfirm, onCancel]);

	return (
		<div
			style={{
				position: "fixed",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: "20px",
				borderRadius: "10px",
				color: "white",
				textAlign: "center",
				zIndex: 2000,
				fontFamily: "Arial, sans-serif",
			}}>
			<h3 style={{ margin: "0 0 15px 0" }}>Portal Confirmation</h3>
			<p style={{ margin: "0 0 15px 0" }}>
				Would you like to go to {targetMap}?
			</p>
			<p style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>
				Press 'E' to confirm, any other key to cancel
			</p>
		</div>
	);
}
