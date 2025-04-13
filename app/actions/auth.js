"use server";
import { request } from "@/lib/aid";
import { createSession, deleteSession, createUserCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(_prevState, formData) {
	const url = "/auth/login";
	const data = {
		email: formData.get("email"),
		password: formData.get("password"),
	};

	let response;

	// Realizar la petición dentro de try/catch para capturar errores de red
	try {
		response = await request(url, "POST", data);
	} catch (error) {
		// Errores del request (ej: conexión fallida, status no esperado)
		if (error.statusCode === 401) {
			return {
				error:
					error.response && error.response.message
						? error.response.message
						: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
			};
		} else {
			console.warn(error);
			return {
				error:
					error.response && error.response.message
						? error.response.message
						: "Error al iniciar sesión. Por favor, inténtelo de nuevo.",
			};
		}
	}

	if (!response.error && response.status === 201 && response.cookie) {
		// Crear cookie de sesión
		await createSession(response.cookie, response.data.user);

		const user = await request("/auth/check");
		if (user.error) {
			console.warn(user.error);
			return {
				error: "Error al iniciar sesión. Por favor, inténtelo de nuevo.",
			};
		}

		await createUserCookie(user.data);
		const accountType = user.data?.accountType;

		// Redirigir a la página de inicio
		if (accountType === "EXTERNAL") {
			redirect("/meetings");
		} else {
			redirect("/");
		}
	} else if (response.error) {
		console.warn(response.error);
		// Manejo de errores específicos de la API
		if (response.status === 401) {
			return {
				error: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
			};
		} else {
			return {
				error: "Error al iniciar sesión. Por favor, inténtelo de nuevo.",
			};
		}
	} else {
		// Respuesta inesperada
		throw new Error(`Unexpected response status: ${response.status}`);
	}
}

export async function logout() {
	await deleteSession();
	redirect("/login");
}
