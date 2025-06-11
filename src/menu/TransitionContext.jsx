import React, { createContext, useContext, useState } from "react";
import TransitionOverlay from "./TransitionOverlay";

const TransitionContext = createContext();

export function useTransition() {
	return useContext(TransitionContext);
}

export function TransitionProvider({ children }) {
	const [show, setShow] = useState(false);
	const [type, setType] = useState("split_diagonal");

	// Show overlay for a duration, then run a callback (e.g., navigation)
	const triggerTransition = (transitionType, duration, callback) => {
		setType(transitionType);
		setShow(true);
		setTimeout(() => {
			callback && callback();
		}, duration / 2); // navigation at halfway point
		setTimeout(() => setShow(false), duration); // overlay stays for full duration
	};

	return (
		<TransitionContext.Provider value={{ show, type, triggerTransition }}>
			<TransitionOverlay type={type} show={show} />
			{children}
		</TransitionContext.Provider>
	);
}
