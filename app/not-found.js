"use client";
import Link from "next/link";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Rocket } from "lucide-react";

export default function NotFound() {
	return (
		<div className="bg-gray-900  text-gray-50 h-screen">
			<div className="flex items-center justify-center h-full w-full">
				<BackgroundGradient animate={true} className="rounded-xl min-w-80 max-w-80 p-4 bg-gray-900">
					<div className="flex justify-center items-center w-full gap-2 pt-4 pb-6">
						<Rocket
							size={60}
							className="bg-gray-900 p-3 rounded-xl shadow-sm shadow-gray-700 animate-pulse"
						/>
					</div>
					<div className="flex flex-col items-center justify-center gap-4">
						<h1 className="text-4xl font-bold">404</h1>
						<p className="text-lg font-semibold">Página no encontrada</p>
						<Link
							className="text-gray-50 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out"
							href="/"
						>
							Volver al inicio
						</Link>
					</div>
				</BackgroundGradient>
			</div>
		</div>
	);
}
