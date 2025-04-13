import { formatNumber } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const gradientClasses = {
	// blue: "bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 shadow-blue-200",

	orange: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-200 via-fuchsia-200 to-indigo-100 shadow-indigo-100",
	blue: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-100 via-blue-200 to-cyan-100 shadow-blue-100",
	green: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-green-200 via-blue-200 to-indigo-100 shadow-blue-100",
	red: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-200 via-red-100 to-orange-200 shadow-orange-100",
	purple: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-200 via-purple-200 to-indigo-100 shadow-blue-100",

	// Agrega más colores según sea necesario
};

export default function MetricCard({ metric, isLoading }) {
	const gradientClass = gradientClasses[metric.color] || gradientClasses["blue"]; // Valor por defecto

	return (
		<div
			className={`flex flex-col justify-between p-4 ${gradientClass} rounded-xl xxs:min-w-32 xs:min-h-32 sm:min-h-36`}
		>
			{isLoading ? (
				<div className="flex flex-col items-center justify-center h-full">
					<LoaderCircle className=" text-gray-500 animate-spin" size={32} />
					<p className="text-center text-gray-500">Cargando...</p>
				</div>
			) : (
				<>
					<div className="flex items-start justify-between gap-2">
						<h3 className="leading-tight max-w-20 xs:text-sm sm:text-md">{metric.title}</h3>

						<div className="xxs:p-0 xs:p-2 sm:p-2 rounded-xl bg-white text-gray-600 bg-opacity-30">
							<metric.icon className="xs:size-4 sm:size-6" />
						</div>
					</div>
					<div className="flex flex-col gap-0">
						<div className="flex items-center justify-between">
							<h2 className="xxs:text-2xl sm:text-4xl font-semibold m-0 leading-none ">
								{formatNumber(metric.value)}
							</h2>
							<h2 className="xxs:text-2xl sm:text-3xl  m-0 leading-none text-gray-500 font-medium  text-right">
								{metric.percentage && `${formatNumber(metric.percentage)}%`}
							</h2>
						</div>

						<p className="text-xs text-gray-500">{metric.time} </p>
					</div>
				</>
			)}
		</div>
	);
}
