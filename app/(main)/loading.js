import { Rocket } from "lucide-react";

export default function Loading() {
	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
			<div className="p-8 border w-96 shadow-lg rounded-md bg-white">
				<div className="flex flex-col justify-center items-center gap-1 text-center py-4">
					<Rocket className="size-6 animate-bounce " />
					<p> Cargando...</p>
				</div>
			</div>
		</div>
	);
}
