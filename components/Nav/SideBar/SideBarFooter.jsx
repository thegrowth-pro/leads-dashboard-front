"use client";

import React, { useActionState } from "react";
import useAppStore from "@/app/store/app";
import { LogOut, UserCog } from "lucide-react";
import { logout } from "@/app/actions/auth";

const SideBarfooter = () => {
	const [state, formAction, isPending] = useActionState(logout, undefined);

	const isSideBarOpen = useAppStore((state) => state.isSideBarOpen);
	const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);

	return (
		<div className="w-full">
			<a
				onClick={() => useAppStore.setState({ isAccountModalOpen: true })}
				className={`flex items-center gap-2 mx-2 p-2 rounded-lg
					 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent cursor-pointer
					`}
			>
				<div className=" flex items-center justify-center p-2">
					<UserCog size={20} />
				</div>
				<p className={`${!isSideBarOpen ? "hidden" : ""}`}>Mi Cuenta</p>
			</a>
			<form>
				<button
					disabled={isPending}
					type="submit"
					formAction={formAction}
					className={`flex items-center  gap-2 mx-2 mb-2 p-2 rounded-lg 
					 hover:text-sidebar-accent-foreground 
					`}
				>
					<div className=" flex items-center justify-center p-2">
						<LogOut size={20} />
					</div>
					<p className={`flex 1 ${!isSideBarOpen ? "hidden" : ""}`}>Cerrar sesión</p>
				</button>
			</form>
		</div>
	);
};

export default SideBarfooter;
