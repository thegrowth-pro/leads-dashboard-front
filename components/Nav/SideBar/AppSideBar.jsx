"use client";

import useAppStore from "@/app/store/app";
import SideBarHead from "./SideBarHead";
import SideBarMain from "./SideBarMain";
import SideBarFooter from "./SideBarFooter";

import {
	Handshake,
	Users2,
	BriefcaseBusiness,
	MessageSquare,
	KeyRound,
	ChartColumnIncreasing,
	CogIcon,
	Bolt,
} from "lucide-react";

export default function AppSideBar({ user }) {
	const isSideBarOpen = useAppStore((state) => state.isSideBarOpen);

	const routes = [
		{
			title: "Overview",
			path: "/",
			icon: ChartColumnIncreasing,
			show: ["ADMIN", "INTERNAL"].includes(user?.accountType),
		},
		// { title: "Mi actividad", path: "/", icon: Activity, show: ["ADMIN", "INTERNAL"].includes(user?.accountType),

		{
			title: "Reuniones",
			path: "/meetings",
			icon: MessageSquare,
			show: ["ADMIN", "INTERNAL", "EXTERNAL"].includes(user?.accountType),
		},
		{
			title: "Clientes",
			path: "/clients",
			icon: BriefcaseBusiness,
			show: ["ADMIN"].includes(user?.accountType),
		},
		{ title: "Equipo", path: "/users", icon: Users2, show: ["ADMIN"].includes(user?.accountType) },

		{ title: "Pods", path: "/pods", icon: Handshake, show: ["ADMIN"].includes(user?.accountType) },
		{ title: "Admins", path: "/admins", icon: KeyRound, show: ["ADMIN"].includes(user?.accountType) },
		{ title: "Configuración", path: "/settings", icon: Bolt, show: ["ADMIN"].includes(user?.accountType) },
	];

	return (
		<div
			className={` flex flex-col justify-between bg-sidebar transition-all duration-300 border-r-2 border-gray-300 ${
				isSideBarOpen ? "w-52" : "w-[72px]"
			}`}
		>
			<div className="flex flex-col gap-2">
				<SideBarHead />
				<SideBarMain routes={routes} isSideBarOpen={isSideBarOpen} />
			</div>

			<SideBarFooter />
		</div>
	);
}
