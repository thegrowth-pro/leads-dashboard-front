import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatNumber(number) {
	if (number === null) {
		return 0;
	}
	const n = new Intl.NumberFormat("de-DE").format(number);

	// round to 1 decimal
	if (n.includes(",")) {
		const [int, dec] = n.split(",");
		return `${int},${dec[0]}`;
	}

	return n;
}

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatDatetoISO(date) {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

export const filterDateOptions = [
	{
		value: "today",
		label: "Hoy",
		start: new Date(new Date().setHours(0, 0, 0, 0)),
		end: new Date(new Date().setHours(23, 59, 59, 999)),
	},
	// {
	// 	value: "tomorrow",
	// 	label: "Mañana",
	// 	start: (function () {
	// 		const date = new Date();
	// 		date.setDate(date.getDate() + 1); // Establece la fecha al día siguiente
	// 		return new Date(date.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
	// 	})(),
	// 	end: (function () {
	// 		const date = new Date();
	// 		date.setDate(date.getDate() + 1); // Establece la fecha al día siguiente
	// 		return new Date(date.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
	// 	})(),
	// },
	// {
	// 	value: "thisWeek",
	// 	label: "Esta semana",
	// 	start: (function () {
	// 		const date = new Date();
	// 		const day = date.getDay();
	// 		const diff = date.getDate() - day + (day == 0 ? -6 : 1); // Hace que el domingo sea el inicio de la semana
	// 		const startOfWeek = new Date(date.setDate(diff));
	// 		return new Date(startOfWeek.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
	// 	})(),
	// 	end: (function () {
	// 		const date = new Date();
	// 		const day = date.getDay();
	// 		const diff = date.getDate() - day + (day == 0 ? -6 : 1) + 6; // Hace que el domingo sea el inicio de la semana
	// 		const endOfWeek = new Date(date.setDate(diff));
	// 		return new Date(endOfWeek.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
	// 	})(),
	// },
	// {
	// 	value: "nextWeek",
	// 	label: "Próxima semana",
	// 	start: (function () {
	// 		const date = new Date();
	// 		const day = date.getDay();
	// 		const diff = date.getDate() - day + (day == 0 ? -6 : 1) + 7; // El domingo siguiente como inicio de la próxima semana
	// 		const startOfNextWeek = new Date(date.setDate(diff));
	// 		return new Date(startOfNextWeek.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
	// 	})(),
	// 	end: (function () {
	// 		const date = new Date();
	// 		const day = date.getDay();
	// 		const diff = date.getDate() - day + (day == 0 ? -6 : 1) + 13; // El próximo domingo + 6 días
	// 		const endOfNextWeek = new Date(date.setDate(diff));
	// 		return new Date(endOfNextWeek.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
	// 	})(),
	// },
	{
		value: "thisMonth",
		label: "Este mes",
		start: (function () {
			const date = new Date();
			const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // Primer día del mes
			return new Date(startOfMonth.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
		})(),
		end: (function () {
			const date = new Date();
			const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Último día del mes
			return new Date(endOfMonth.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
		})(),
	},
	{
		value: "lastMonth",
		label: "Mes pasado",
		start: (function () {
			const date = new Date();
			const startOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1); // Primer día del mes pasado
			return new Date(startOfLastMonth.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
		})(),
		end: (function () {
			const date = new Date();
			const endOfLastMonth = new Date(date.getFullYear(), date.getMonth(), 0); // Último día del mes pasado
			return new Date(endOfLastMonth.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
		})(),
	},
	// {
	// 	value: "last3Months",
	// 	label: "Últimos 3 meses",
	// 	start: (function () {
	// 		const date = new Date();
	// 		date.setMonth(date.getMonth() - 3); // 3 meses atrás
	// 		const startOfLast3Months = new Date(date.setHours(0, 0, 0, 0)); // Inicio de los últimos 3 meses
	// 		return new Date(startOfLast3Months);
	// 	})(),
	// 	end: (function () {
	// 		const date = new Date();
	// 		return new Date(date.setHours(23, 59, 59, 999)); // Hoy
	// 	})(),
	// },
	{
		value: "thisYear",
		label: "Este año",
		start: (function () {
			const date = new Date();
			const startOfYear = new Date(date.getFullYear(), 0, 1); // Primer día del año
			return new Date(startOfYear.setHours(0, 0, 0, 0)); // Establece la hora a las 00:00:00
		})(),
		end: (function () {
			const date = new Date();
			const endOfYear = new Date(date.getFullYear(), 11, 31); // Último día del año
			return new Date(endOfYear.setHours(23, 59, 59, 999)); // Establece la hora a las 23:59:59
		})(),
	},
	{
		value: "custom",
		label: "Personalizado",
	},
];
