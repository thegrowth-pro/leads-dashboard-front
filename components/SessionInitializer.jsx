"use client";

import { useEffect } from "react";
import useSessionStore from "@/app/store/session";

export default function SessionInitializer({ session }) {
	const { setSession } = useSessionStore();

	useEffect(() => {
		setSession(session);
	}, [session, setSession]);

	return null;
}
