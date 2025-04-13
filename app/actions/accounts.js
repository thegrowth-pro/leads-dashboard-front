"use server";

import { buildQueryParams, request } from "@/lib/aid";

export async function changePassword({ newPassword, currentPassword }) {
	const url = "/auth/change-password";
	const body = { newPassword, oldPassword: currentPassword };

	const { data, error } = await request(url, "PATCH", body);

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function resetPassword({ userId, userType }) {
	let url = `/auth/change-password/${userId}?userType=${userType}`;
	if (userType === "admin") {
		url = `/auth/change-password/${userId}`;
	}

	const { data, error } = await request(url, "PATCH");

	if (error) {
		return { error };
	}
	return { status: "success" };
}
