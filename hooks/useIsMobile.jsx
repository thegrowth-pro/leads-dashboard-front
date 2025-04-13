"use client"; // Este hook utiliza hooks del cliente

import { useEffect } from "react";
import useAppStore from "@/app/store/app";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const setIsMobile = useAppStore((state) => state.setIsMobile);
	const setIsSideBarOpen = useAppStore((state) => state.setIsSideBarOpen);

	useEffect(() => {
		// Asegúrate de que estamos en el cliente
		if (typeof window === "undefined") return;

		const handleResize = () => {
			const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
			setIsSideBarOpen(!isMobile);
			setIsMobile(isMobile);
		};

		// Verificar el estado inicial
		handleResize();

		// Escuchar cambios de tamaño de ventana
		window.addEventListener("resize", handleResize);

		// Limpiar el listener al desmontar
		return () => window.removeEventListener("resize", handleResize);
	}, [setIsMobile]);
}
