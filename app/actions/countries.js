"use server";

import { request, buildQueryParams } from "@/lib/aid";

export async function fetchCountries(searchTerm) {
	const queryParams = buildQueryParams({ search: searchTerm });

	const url = `/countries?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function updateCountry(formData) {
	const id = formData.id;
	const name = formData.name;
	const code = formData.code;

	const url = `/countries/${id}`;

	const { data, error } = await request(url, "PATCH", {
		name,
		code,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function createCountry(formData) {
	const name = formData.name;
	const code = formData.code;

	const url = `/countries`;

	const { data, error } = await request(url, "POST", {
		name,
		code,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function deleteCountries(id) {
	const url = `/countries/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}
