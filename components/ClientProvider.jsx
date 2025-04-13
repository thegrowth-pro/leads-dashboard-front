"use client"; // Este es un componente del cliente

import { useIsMobile } from "@/hooks/useIsMobile";

export default function ClientProvider({ children }) {
	useIsMobile(); // Ejecuta el hook al montar el componente

	return children;
}
