"use server";

import { buildQueryParams, request } from "@/lib/aid";

export async function fetchAdmins(searchTerm = null) {
	const queryParams = buildQueryParams({ search: searchTerm });

	const url = `/accounts/admin?${queryParams}`;
	const { data, error } = await request(url);
	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchAdminDetails(id) {
	const url = `/accounts/admin`;
	const { data, error } = await request(url);
	const admin = data.find((admin) => admin.id === id);

	if (error) {
		return { error };
	}
	return admin;
}

export async function updateAdmin(formData) {
	const id = formData.id;
	const email = formData.email;

	const url = `/accounts/${id}`;

	const { data, error } = await request(url, "PATCH", {
		email,
	});

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function createAdmin(formData) {
	const email = formData.email;

	const url = `/accounts/`;

	const { data, error } = await request(url, "POST", {
		email,
		type: "ADMIN",
	});

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function deleteAdmin(id) {
	const url = `/accounts/${id}`;
	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}
