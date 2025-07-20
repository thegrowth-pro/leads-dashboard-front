"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function makeRequest(endpoint, options = {}) {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("connect.sid");

	const config = {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(sessionCookie && { Cookie: `connect.sid=${sessionCookie.value}` }),
			...options.headers,
		},
		...options,
	};

	try {
		const response = await fetch(`${API_URL}${endpoint}`, config);
		
		if (!response.ok) {
			return { data: null, error: { message: "Error en la respuesta del servidor" } };
		}

		const data = await response.json();
		return { data, error: null };
	} catch (error) {
		console.error("Error en la solicitud:", error);
		return { data: null, error: { message: "Error de conexión" } };
	}
}

export async function checkWorkflowHealth() {
	return makeRequest("/integrations/workflow/health", {
		method: "GET",
	});
} 