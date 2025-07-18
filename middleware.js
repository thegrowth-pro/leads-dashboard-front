import { NextResponse } from "next/server";
import { encrypt, deleteSession, createUserCookie } from "@/lib/session";
import { request } from "@/lib/aid";

// 1. Specify protected and public routes
const protectedRoutes = [
	"/dashboard",
	"/",
	"/meetings",
	"/meetings/*",
	"/users",
	"/users/*",
	"/pods",
	"/pods/*",
	"/clients",
	"/clients/*",
	"/clients/new",
	"/admins",
	"/admins/*",
	"/*",
];
const externalRoutes = ["/meetings", "/meetings/*"];
const internalRoutes = [
	"/dashboard",
	"/",
	"/meetings",
	"/meetings/*",
	"/clients",
	"/clients/*",
	"/clients/new",
];
const publicRoutes = ["/login"];
const accountTypes = { EXTERNAL: externalRoutes, INTERNAL: internalRoutes, ADMIN: protectedRoutes };

export default async function middleware(req) {
	// 2. Check if the current route is protected or public

	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.includes(path);
	const isPublicRoute = publicRoutes.includes(path);

	let response;
	try {
		response = await request("/auth/check");
	} catch (error) {
		console.error("Middleware: Error checking auth:", error);
		// Si hay error en la autenticación y es una ruta protegida, redirigir al login
		if (isProtectedRoute) {
			await deleteSession();
			return NextResponse.redirect(new URL("/login", req.nextUrl));
		}
		// Si es una ruta pública, permitir continuar
		return NextResponse.next();
	}

	if (isProtectedRoute && response.status !== 200) {
		await deleteSession();
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	// Solo crear la cookie del usuario si tenemos datos válidos
	if (response.data && typeof response.data === 'object') {
		try {
			await createUserCookie(response.data);
		} catch (error) {
			console.error("Middleware: Error creating user cookie:", error);
			// Si no podemos crear la cookie del usuario y es una ruta protegida, redirigir al login
			if (isProtectedRoute) {
				await deleteSession();
				return NextResponse.redirect(new URL("/login", req.nextUrl));
			}
		}
	}

	const accountType = response.data?.accountType;
	const userRole = response.data?.role;

	// Specific rule: allow only MANAGERs within INTERNAL account type to access clients routes
	const isClientsRoute = path === "/clients" || path.startsWith("/clients/") || path === "/clients/new";
	if (accountType === "INTERNAL" && isClientsRoute && userRole !== "MANAGER") {
		return NextResponse.redirect(new URL("/meetings", req.nextUrl));
	}

	if (isProtectedRoute && accountType && !accountTypes[accountType]?.includes(path)) {
		return NextResponse.redirect(new URL("/meetings", req.nextUrl));
	}

	if (isPublicRoute && response.status === 200) {
		return NextResponse.redirect(new URL("/", req.nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
