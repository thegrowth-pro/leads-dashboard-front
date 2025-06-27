// import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1d")
		.sign(encodedKey);
}

export async function decrypt(session) {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload;
	} catch (error) {
		console.log("Failed to verify session:", error.message);
		return null;
	}
}

export async function createSession(cookie) {
	const [cookiePair, ...rest] = cookie.split("; ");
	const [name, value] = cookiePair.split("=");
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const cookieStore = await cookies();
	cookieStore.set(name, value, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: "lax",
	});
}

export async function createUserCookie(userData) {
	const cookieStore = await cookies();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	// Save user data in session
	const session = await encrypt(userData);

	cookieStore.set("user", session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
		sameSite: "lax",
	});
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete("connect.sid");
	cookieStore.delete("user");
}

export async function getSession() {
	const cookieStore = await cookies();
	const session = cookieStore.get("user");

	if (session) {
		return await decrypt(session.value);
	}
}
