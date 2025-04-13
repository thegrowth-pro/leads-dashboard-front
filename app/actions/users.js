"use server";

import { buildQueryParams, request } from "@/lib/aid";

export async function fetchUsers(searchTerm = null, filters) {
	// filters =  { role: [ 'SDR', 'MANAGER' ], pod: [ '3' ] }

	const queryParams = buildQueryParams({ search: searchTerm, ...filters });

	const url = `/users?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchUserDetails(id) {
	const url = `/users/${id}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: null };
	}
	return {
		status: "success",
		data,
	};
}

export async function updateUser(formData) {
	const id = formData.id;
	const name = formData.name;
	const email = formData.email;
	const role = formData.role;
	const pod = formData.pod;

	const url = `/users/${id}`;

	const body = {
		name,
		email,
		role,
		podId: pod || null,
	};

	Object.keys(body).forEach((key) => {
		if (body[key] === null) {
			delete body[key];
		}
	});

	const { data, error } = await request(url, "PATCH", body);

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function createUser(formData) {
	const name = formData.name;
	const email = formData.email;
	const role = formData.role;

	const url = `/users/`;

	const { data, error } = await request(url, "POST", {
		name,
		email,
		role,
	});

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function deleteUser(id) {
	const url = `/users/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function fetchManagers() {
	// filters =  { role: [ 'SDR', 'MANAGER' ], pod: [ '3' ] }

	const queryParams = buildQueryParams({ role: ["MANAGER"] });

	const url = `/users?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchSDRs() {
	// filters =  { role: [ 'SDR', 'MANAGER' ], pod: [ '3' ] }

	const queryParams = buildQueryParams({ role: ["SDR"] });

	const url = `/users?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}
