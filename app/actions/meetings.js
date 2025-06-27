"use server";

import { buildQueryParams, request } from "@/lib/aid";

const mapStatus = (status) => {
	if (status === "-1") return null;
	if (status === "0") return false;
	if (status === "1") return true;
	else return null;
};

export async function fetchMeetings(
	searchTerm = null,
	filters,
	page = 1,
	startDate = null,
	endDate = null,
	selectedClient = null,
	selectedPod = null
) {
	const queryParams = buildQueryParams({
		search: searchTerm,
		...filters,
		size: 10,
		page,
		startDate,
		endDate,
		clientId: selectedClient,
		podId: selectedPod,
	});

	const url = `/meetings?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [], count: 0 };
	}
	return { data: data.meetings, count: data.count };
}

export async function fetchMeetingDetails(id) {
	const url = `/meetings/${id}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function updateMeeting(formData) {
	const id = formData.id;
	const prospect = formData.prospect || null;
	const country = formData.country || null;
	const prospectContactRole = formData.prospectContactRole || null;
	const prospectContactName = formData.prospectContactName || null;
	const prospectContactEmail = formData.prospectContactEmail || null;
	const prospectContactPhone = formData.prospectContactPhone || null;
	const inbox = formData.inbox || null;
	const held = formData.held;
	const validated = formData.validated;
	const additionalFields = formData.additionalFields || null;

	const url = `/meetings/${id}`;

	// Send only data that is not null
	const body = {
		prospect,
		countryId: country,
		prospectContactRole,
		prospectContactName,
		prospectContactEmail,
		prospectContactPhone,
		inboxId: inbox || null,
		held,
		validated,
		additionalFields,
	};

	Object.keys(body).forEach((key) => {
		if (body[key] === null && key !== "held" && key !== "validated" && key !== "additionalFields") {
			delete body[key];
		}
	});

	const { data, error } = await request(url, "PATCH", body);

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function createMeeting(formData) {
	const clientId = formData.client;
	const sellers = formData.sellers;
	const country = formData.country || null;
	const date = formData.date;
	const prospect = formData.prospect || null;
	const prospectContactRole = formData.prospectContactRole || null;
	const prospectContactName = formData.prospectContactName || null;
	const prospectContactEmail = formData.prospectContactEmail || null;
	const prospectContactPhone = formData.prospectContactPhone || null;
	const inbox = formData.inbox || null;
	const channel = formData.channel;
	const additionalFields = formData.additionalFields || null;
	const generateGoogleMeetLink = formData.generateGoogleMeetLink;

	const url = `/meetings/`;

	// Send only data that is not null
	const body = {
		clientId,
		sellers,
		date,
		prospect,
		countryId: country,
		prospectContactRole,
		prospectContactName,
		prospectContactEmail,
		prospectContactPhone,
		inboxId: inbox || null,
		channel,
		additionalFields,
		generateGoogleMeetLink
	};

	Object.keys(body).forEach((key) => {
		if (body[key] === null || body[key] === "") {
			delete body[key];
		}
	});

	const { data, error } = await request(url, "POST", body);

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function deleteMeeting(id) {
	const url = `/meetings/${id}`;

	const { data, error } = await request(url, "DELETE");

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function updateMeetingHeldStatus(id, held) {
	const url = `/meetings/${id}`;

	const { data, error } = await request(url, "PATCH", { held });

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function updateMeetingValidatedStatus(id, validated) {
	const url = `/meetings/${id}`;

	const { data, error } = await request(url, "PATCH", { validated });

	if (error) {
		return { error };
	}
	return { status: "success" };
}

export async function addComment(formData) {
	const meetingId = formData.meetingId;
	const text = formData.text;

	const url = `/meetings/${meetingId}/comment`;

	const { data, error } = await request(url, "POST", { text });

	if (error) {
		return { error, data: null };
	}
	return { status: "success", data };
}

export async function rescheduleMeeting(id, newDate) {
	const url = `/meetings/${id}`;

	const { data, error } = await request(url, "PATCH", {
		date: newDate,
		held: null,
		validated: null,
		recovered: true,
	});

	if (error) {
		return { error };
	}
	return { status: "success" };
}
