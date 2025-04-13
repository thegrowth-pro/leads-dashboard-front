"use server";

import { request, buildQueryParams } from "@/lib/aid";

export async function fetchClients(searchTerm, filters) {
	const queryParams = buildQueryParams({ search: searchTerm, ...filters });

	const url = `/clients?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchClientDetails(id) {
	const url = `/clients/${id}`;
	const inboxesUrl = `/clients/${id}/inboxes`;
	const { data, error } = await request(url);
	const { data: inboxesData, error: inboxesError } = await request(inboxesUrl);

	if (error) {
		return { error, data: null };
	}

	if (inboxesError) {
		return { inboxesError, data: null };
	}

	data.inboxes = inboxesData;

	return {
		status: "success",
		data,
	};
}

export async function updateClient(formData) {
	const id = formData.id;
	const name = formData.name;
	const email = formData.email;
	const assignedPodId = formData?.assignedPod;

	const url = `/clients/${id}`;

	const { data, error } = await request(url, "PATCH", {
		name,
		email,
		assignedPodId,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function createClient(formData) {
	const name = formData.name;
	const email = formData.email;
	const assignedPodId = formData?.assignedPod;

	const url = `/clients`;

	const { data, error } = await request(url, "POST", {
		name,
		email,
		assignedPodId: assignedPodId === "" ? null : assignedPodId,
	});

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function deleteClient(id) {
	const url = `/clients/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function addClientSeller(clientId, formData) {
	const name = formData.name;
	const email = formData.email;

	const url = `/sellers`;

	const { data, error } = await request(url, "POST", {
		name,
		email,
		clientId,
	});

	if (error) {
		if (error.status === 409) {
			to;
		}
		return { error };
	}
	return { status: "success" };
}

export async function deleteClientSeller(id) {
	const url = `/sellers/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function fetchSellers(clientId) {
	const url = `/sellers?clientId=${clientId}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function fetchClientInboxes(clientId) {
	const url = `/clients/${clientId}/inboxes`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { data };
}

export async function addClientInbox(clientId, formData) {
	const email = formData.email;

	const url = `/clients/${clientId}/inboxes`;

	const { data, error } = await request(url, "POST", {
		email,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function deleteClientInbox(inboxId) {
	const url = `/clients/inboxes/${inboxId}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error };
	}
	return { status: "success" };
}
