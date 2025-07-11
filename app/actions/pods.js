"use server";

import { request, buildQueryParams } from "@/lib/aid";

export async function fetchPods(searchTerm, filters) {
	const queryParams = buildQueryParams({ search: searchTerm, ...filters });

	const url = `/pods?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchPodDetails(id) {
	const url = `/pods/${id}`;
	const { data, error } = await request(url);

	if (error) {
		return { error };
	}
	return data;
}

export async function updatePod(formData) {
	const id = formData.id;
	const name = formData.name;
	const manager = formData.manager;
	const googleCalendarId = formData.googleCalendarId;

	const url = `/pods/${id}`;

	const { data, error } = await request(url, "PATCH", {
		name,
		managerId: manager || null,
		googleCalendarId: googleCalendarId || null,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function createPod(formData) {
	const name = formData.name;
	const manager = formData.manager;
	const googleCalendarId = formData.googleCalendarId;

	const url = `/pods`;

	const { data, error } = await request(url, "POST", {
		name,
		managerId: manager || null,
		googleCalendarId: googleCalendarId || null,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function deletePod(id) {
	const url = `/pods/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function addIntegrant(podId, userId) {
	const url = `/users/${userId}`;

	const { data, error } = await request(url, "PATCH", {
		podId,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function removeIntegrant(userId) {
	const url = `/users/${userId}`;

	const { data, error } = await request(url, "PATCH", {
		podId: null,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}
