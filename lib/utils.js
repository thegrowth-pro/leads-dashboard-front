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

	const str = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
	return str;
}

const getStartDate = (date) => {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}T00:00:00`;
};

const getEndDate = (date) => {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}T23:59:59`;
};

export const filterDateOptions = [
	{
		value: "allways",
		label: "Desde siempre",
		start: null,
		end: null,
	},

	{
		value: "today",
		label: "Hoy",
		start: getStartDate(new Date()),
		end: getEndDate(new Date()),
	},

	{
		value: "thisMonth",
		label: "Este mes",
		start: (function () {
			const date = new Date();
			date.setDate(1);
			return getStartDate(date);
		})(),
		end: (function () {
			const date = new Date();
			date.setMonth(date.getMonth() + 1);
			date.setDate(0);
			return getEndDate(date);
		})(),
	},
	{
		value: "lastMonth",
		label: "Mes pasado",
		start: (function () {
			const date = new Date();
			date.setMonth(date.getMonth() - 1);
			date.setDate(1);
			return getStartDate(date);
		})(),
		end: (function () {
			const date = new Date();
			date.setDate(0);
			return getEndDate(date);
		})(),
	},

	{
		value: "thisYear",
		label: "Este año",
		start: (function () {
			const date = new Date();
			date.setMonth(0);
			date.setDate(1);
			return getStartDate(date);
		})(),
		end: (function () {
			const date = new Date();
			date.setMonth(11);
			date.setDate(31);
			return getEndDate(date);
		})(),
	},
	{
		value: "custom",
		label: "Personalizado",
	},
];
