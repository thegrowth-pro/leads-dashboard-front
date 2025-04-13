import { cookies } from "next/headers";

export async function request(url, method = "GET", data = null, headers = {}, params = {}) {
	try {
		// Asegurar que la URL siempre comience con process.env.API_URL
		if (!url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
			url = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
		}

		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("connect.sid");
		const cookieHeader = sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : null;

		const options = {
			method,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				cookie: cookieHeader,
				...headers,
			},
			// credentials: "include", // No es necesario para el lado del servidor
		};

		// Construir la URL con los parámetros de consulta si es GET
		if (method === "GET" && Object.keys(params).length > 0) {
			const queryParams = new URLSearchParams(params).toString();
			url += `?${queryParams}`;
		}
		if (data) {
			options.body = JSON.stringify({ ...data });
		}
		
		const response = await fetch(url, options);

		const setCookie = response.headers.get("set-cookie");

		// Guardar status antes de parsear el body
		const { status } = response;

		if (!response.ok) {
			// Leer la respuesta de error antes de lanzar la excepción
			const contentType = response.headers.get("Content-Type");
			let errorData;
			if (contentType && contentType.includes("application/json")) {
				errorData = await response.json();
				console.log(errorData);
			} else {
				errorData = await response.text();
			}

			const error = new Error((errorData && errorData.message) || `HTTP error! status: ${status}`);

			error.response = errorData;
			error.statusCode = status;
			throw error;
		}
		const contentType = response.headers.get("Content-Type");
		let responseData;
		if (contentType && contentType.includes("application/json")) {
			responseData = await response.json();
		} else {
			responseData = await response.text();
		}

		// Retornar data y status en caso de éxito
		return {
			data: responseData,
			status: status,
			cookie: setCookie,
		};
	} catch (error) {
		console.warn("Request failed", error);

		return {
			error: error.response || error.message,
			status: error.statusCode || 500,
		};
	}
}

export function buildQueryParams(filters) {
	const params = new URLSearchParams();
	for (const [key, values] of Object.entries(filters)) {
		if (Array.isArray(values)) {
			// Agregar cada valor de la lista como un parámetro separado
			values.forEach((value) => params.append(key, value));
		} else {
			// Si no es una lista, agregarlo directamente
			if (values) {
				params.append(key, values);
			}
		}
	}
	return params.toString(); // Retorna los parámetros como un string
}
