import localFont from "next/font/local";
import "./globals.css";

import ClientProvider from "@/components/ClientProvider";

const lufga = localFont({
	src: [
		{ path: "/fonts/LufgaRegular.woff", weight: "400", style: "normal" },
		{ path: "/fonts/LufgaMedium.woff", weight: "500", style: "normal" },
		{ path: "/fonts/LufgaSemiBold.woff", weight: "600", style: "normal" },
		{ path: "/fonts/LufgaBold.woff", weight: "700", style: "normal" },
	],
	variable: "--font-lufga",
});

export const metadata = {
	title: "TGP Dashboard",
	description: "The Growth Project Meeting Dashboard",
};

export default function AppLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${lufga.variable} flex h-screen w-screen overflow-x-hidden max-w-full`}>
				<ClientProvider>
					<main className="flex flex-col flex-1 bg-background w-full overflow-x-hidden max-w-full">
						{children}
					</main>
				</ClientProvider>
			</body>
		</html>
	);
}
