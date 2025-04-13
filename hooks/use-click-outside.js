"use client";

import { useEffect } from "react";

export function useOnClickOutside(ref, handler) {
	useEffect(() => {
		const listener = (event) => {
			// No hacer nada si el clic fue dentro del elemento
			if (!ref.current || ref.current.contains(event.target)) {
				return;
			}

			handler(event);
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [ref, handler]);
}
