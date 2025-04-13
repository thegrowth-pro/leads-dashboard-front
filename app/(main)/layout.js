import React from "react";
import AppSideBar from "@/components/Nav/SideBar/AppSideBar";
import TopBar from "@/components/Nav/TopBar/TopBar";
import FilterResetHandler from "../FilterResetHandler";
import { Toaster } from "@/components/ui/toaster";
import { getSession } from "@/lib/session";
import AccountModal from "@/app/(main)/(account)/AccountModal";
import SessionInitializer from "@/components/SessionInitializer";

export default async function AppLayout({ children }) {
	const session = await getSession();

	return (
		<div className="flex h-screen w-screen overflow-hidden">
			<FilterResetHandler />
			<SessionInitializer session={session} />
			<AppSideBar user={session} />
			<AccountModal session={session} />
			<div className="flex flex-col w-full overflow-hidden max-h-screen">
				<TopBar />
				<main className="flex flex-col flex-1 bg-background w-full overflow-y-auto">{children}</main>
				<Toaster />
			</div>
		</div>
	);
}
