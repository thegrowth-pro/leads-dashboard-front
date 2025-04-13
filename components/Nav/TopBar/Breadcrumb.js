"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

const Breadcrumb = () => {
	const pathname = usePathname();
	const query = useParams();
	// Divide el pathname en segmentos
	let pathSegments = pathname.split("/").filter((seg) => seg);
	if (pathSegments.length === 0) {
		pathSegments = ["Dashboard"];
	}

	// Construye las rutas acumuladas
	const breadcrumbs = pathSegments.map((segment, index) => {
		// Reemplaza segmentos dinámicos con sus valores reales si existen en query
		const text = query[segment] ? query[segment] : segment.charAt(0).toUpperCase() + segment.slice(1);
		const href = "/" + pathSegments.slice(0, index + 1).join("/");
		return { href, text };
	});
	return (
		<nav className="flex text-sm gap-1">
			<div className="flex items-center gap-1">
				<Link href="/" className="text-gray-500 hover:text-sidebar-accent-foreground hover:font-semibold">
					Home
				</Link>
				<ChevronRight className="h-4 w-4 text-gray-500" />
			</div>

			{breadcrumbs.slice(0, 1).map((crumb, index) => (
				<div key={crumb.href} className="flex items-center gap-1">
					<Link
						href={crumb.href}
						className="text-gray-500 hover:text-sidebar-accent-foreground hover:font-semibold"
					>
						{crumb.text.length > 20 ? `${crumb.text.slice(0, 20)}...` : crumb.text}
					</Link>
					{index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-500" />}
				</div>
			))}
		</nav>
	);
};

export default Breadcrumb;
