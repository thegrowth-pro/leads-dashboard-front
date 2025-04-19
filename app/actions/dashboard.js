"use server";

import { request, buildQueryParams } from "@/lib/aid";

export async function getTotalStats(filters) {
	const queryParams = buildQueryParams({ ...filters });

	const url = `/meetings/stats/totals?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { status: "success", data };
}

export async function getClientRanking(filters) {
	if (filters.startDate) {
		filters.startDate = filters.startDate.toISOString();
	}
	if (filters.endDate) {
		filters.endDate = filters.endDate.toISOString();
	}
	const queryParams = buildQueryParams({ ...filters });

	const url = `/meetings/stats/clients?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { status: "success", data };
}

export async function getSdrRanking(filters) {
	if (filters.startDate) {
		filters.startDate = filters.startDate.toISOString();
	}
	if (filters.endDate) {
		filters.endDate = filters.endDate.toISOString();
	}
	const queryParams = buildQueryParams({ ...filters });

	const url = `/meetings/stats/sdrs?${queryParams}`;
	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { status: "success", data };
}

export async function getPodRanking(filters) {
	if (filters.startDate) {
		filters.startDate = filters.startDate.toISOString();
	}
	if (filters.endDate) {
		filters.endDate = filters.endDate.toISOString();
	}
	const queryParams = buildQueryParams({ ...filters });

	const url = `/meetings/stats/pods?${queryParams}`;

	const { data, error } = await request(url);

	if (error) {
		return { error, data: [] };
	}
	return { status: "success", data };
}
