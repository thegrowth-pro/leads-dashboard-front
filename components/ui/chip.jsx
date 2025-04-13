import React from "react";

const Chip = ({ color, className, children, ...props }) => {
	const colors = {
		red: "text-red-600 bg-red-200",
		blue: "text-blue-600 bg-blue-200",
		green: "text-green-600 bg-green-200",
		yellow: "text-yellow-600 bg-yellow-200",
		indigo: "text-indigo-600 bg-indigo-200",
		orange: "text-orange-600 bg-orange-200",
		// Agrega más colores según sea necesario
	};

	const colorClasses = colors[color] || "text-gray-600 bg-gray-200";

	return (
		<div
			{...props}
			className={`${className} inline-block px-2 py-1 rounded-lg text-xs  text-center ${colorClasses}`}
		>
			{children}
		</div>
	);
};

export default Chip;
