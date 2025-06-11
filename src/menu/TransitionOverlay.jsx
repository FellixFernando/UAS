import React from "react";
import "./easytransitions.css";

export default function TransitionOverlay({ type = "split_diagonal", show }) {
	return (
		<div className={`easytransitions_transition ${!show ? "hidden" : ""}`}>
			<div className={`easytransitions_transition__part-1 ${type}`}></div>
			<div className={`easytransitions_transition__part-2 ${type}`}></div>
			<div className={`easytransitions_transition__part-3 ${type}`}></div>
			<div className={`easytransitions_transition__part-4 ${type}`}></div>
			<div className={`easytransitions_transition__part-5 ${type}`}></div>
			<div className={`easytransitions_transition__part-6 ${type}`}></div>
			<div className={`easytransitions_transition__part-7 ${type}`}></div>
			<div className={`easytransitions_transition__part-8 ${type}`}></div>
		</div>
	);
}
