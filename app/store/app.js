"use client";

import { create } from "zustand";

const useAppStore = create((set) => ({
	// State
	isMobile: false,
	isSideBarOpen: false,
	isAccountModalOpen: false,

	// Actions
	setIsMobile: (value) => set({ isMobile: value }),
	setIsSideBarOpen: (value) => set({ isSideBarOpen: value }),
	setIsAccountModalOpen: (value) => set({ isAccountModalOpen: value }),
}));

export default useAppStore;
