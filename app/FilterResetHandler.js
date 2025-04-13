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

		if (pathname && lastPath && pathname !== lastPath) {
			resetFilters();
		}
		useFilterStore.setState({ lastPath: pathname });
	}, [pathname, mounted]);

	return null;
}
