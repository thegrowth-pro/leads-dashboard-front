"use client";

import useAppStore from "@/app/store/app";

import { RocketIcon } from "lucide-react";

export default function SideBarHead() {
	const isSideBarOpen = useAppStore((state) => state.isSideBarOpen);

	return (
		<div className={`flex items-center gap-2 m-2 p-2 h-14`}>
			<div className="p-2 bg-gray-950 color-gray-50 rounded-lg">
				<RocketIcon size={24} color="#FFF" />
			</div>

			{isSideBarOpen && (
				<p className="text-foreground font-bold text-3xl"> TGP </p>
			)}
		</div>
	);
}
