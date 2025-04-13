"use client";

import useAppStore from "@/app/store/app";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ToggleDrawerButton() {
	const isSideBarOpen = useAppStore((state) => state.isSideBarOpen);

	return (
		<button
			className="text-gray-500"
			onClick={() =>
				useAppStore.setState({ isSideBarOpen: !isSideBarOpen })
			}
		>
			{isSideBarOpen ? (
				<PanelLeftClose size={16} />
			) : (
				<PanelLeftOpen size={16} />
			)}
		</button>
	);
}
