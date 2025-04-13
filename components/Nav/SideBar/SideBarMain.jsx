"use client";

import { usePathname } from "next/navigation";

const SideBarMain = ({ routes, isSideBarOpen }) => {
	const pathname = usePathname();

	const isRouteActive = (route) => {
		if (route.path === "/") {
			return pathname === route.path;
		}
		return pathname.includes(route.path);
	};

	return (
		<div>
			{routes.map(
				(route) =>
					route.show && (
						<a
							key={route.title}
							href={route.path}
							className={`flex items-center gap-2 m-2 p-2 rounded-lg
					 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent
					${isRouteActive(route) ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground"}`}
						>
							<div className=" flex items-center justify-center p-2">
								<route.icon size={20} />
							</div>
							<p className={`${!isSideBarOpen ? "hidden" : ""}`}>{route.title}</p>
						</a>
					)
			)}
		</div>
	);
};

export default SideBarMain;
