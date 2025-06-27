"use server";

import { request } from "@/lib/aid";

export async function fetchForms() {
	const { data, error } = await request("/forms", "GET");
	return { data, error };
}

export async function fetchFormById(id) {
	const { data, error } = await request(`/forms/${id}`, "GET");
	return { data, error };
}

export async function fetchFormsByClient(clientId) {
	const { data, error } = await request(`/forms/client/${clientId}`, "GET");
	return { data, error };
}

export async function fetchActiveFormByClient(clientId) {
	const { data, error } = await request(`/forms/client/${clientId}/active`, "GET");
	return { data, error };
}

export async function createForm(formData) {
	const { data, error } = await request("/forms", "POST", formData);
	return { data, error };
}

export async function updateForm(id, formData) {
	const { data, error } = await request(`/forms/${id}`, "PATCH", formData);
	return { data, error };
}

export async function deleteForm(id) {
	const { data, error } = await request(`/forms/${id}`, "DELETE");
	return { data, error };
}

export async function activateForm(id) {
	const { data, error } = await request(`/forms/${id}/activate`, "PATCH");
	return { data, error };
}

export async function fetchFormPresets() {
	const { data, error } = await request("/forms/presets", "GET");
	return { data, error };
} 