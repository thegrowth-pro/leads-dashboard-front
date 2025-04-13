"use-client";
import { create } from "zustand";

const useSessionStore = create((set) => ({
	// State
	session: null,

	// Actions
	setSession: (value) => set({ session: value }),
}));

export default useSessionStore;
