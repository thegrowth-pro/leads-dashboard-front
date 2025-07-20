// app/FilterResetHandler.tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useFilterStore from "@/app/store/filter";

export default function FilterResetHandler() {
	const pathname = usePathname();
	// Usamos useState para asegurar la hidratación correcta
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const { resetFilters, lastPath } = useFilterStore.getState();

		// Función para obtener la sección base de una ruta
		const getBaseSection = (path) => {
			if (!path) return '';
			const segments = path.split('/').filter(Boolean);
			return segments.length > 0 ? `/${segments[0]}` : '/';
		};

		const currentSection = getBaseSection(pathname);
		const lastSection = getBaseSection(lastPath);

		// Solo resetear filtros si cambiamos de sección completamente
		// No resetear si navegamos dentro de la misma sección (ej: /meetings -> /meetings/123 -> /meetings)
		if (pathname && lastPath && currentSection !== lastSection) {
			resetFilters();
		}
		
		useFilterStore.setState({ lastPath: pathname });
	}, [pathname, mounted]);

	return null;
}
