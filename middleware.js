import { NextResponse } from "next/server";
import { encrypt, deleteSession, createUserCookie } from "@/lib/session";
import { cookies } from "next/headers";
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
const internalRoutes = ["/dashboard", "/", "/meetings", "/meetings/*"];
const publicRoutes = ["/login"];
const accountTypes = { EXTERNAL: externalRoutes, INTERNAL: internalRoutes, ADMIN: protectedRoutes };

export default async function middleware(req) {
	// 2. Check if the current route is protected or public

	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.includes(path);
	const isPublicRoute = publicRoutes.includes(path);

	const response = await request("/auth/check");

	if (isProtectedRoute && response.status !== 200) {
		await deleteSession();
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	await createUserCookie(response.data);
	const accountType = response.data?.accountType;

	if (isProtectedRoute && !accountTypes[accountType].includes(path)) {
		return NextResponse.redirect(new URL("/meetings", req.nextUrl));
	}

	if (isPublicRoute && response.status === 200) {
		return NextResponse.redirect(new URL("/", req.nextUrl));
	}

	return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
