"use client";
import { CalendarCheck, CalendarClock, CalendarX, CircleDollarSign } from "lucide-react";
import MetricCard from "../../../components/Dashboard/MetricCard";

export default function CardsGroup({ data, time, isLoading }) {
	const metric_1 = {
		title: "Reuniones generadas",
		value: data?.totalMeetings,
		icon: CalendarClock,
		time,
		color: "orange",
	};

	const metric_2 = {
		title: "Reuniones realizadas",
		value: data?.totalHeld,
		icon: CalendarCheck,
		percentage: (data?.totalHeld / data?.totalMeetings) * 100 || 0,
		time,
		color: "green",
	};

	const metric_3 = {
		title: "Reuniones válidas",
		value: data?.totalValidated,
		icon: CircleDollarSign,
		percentage: (data?.totalValidated / data?.totalMeetings) * 100 || 0,
		time,
		color: "orange",
	};

	const metric_4 = {
		title: "Reuniones no-show",
		value: data?.totalNoShow,
		icon: CalendarX,
		percentage: (data?.totalNoShow / data?.totalMeetings) * 100 || 0,
		time,
		color: "green",
	};

	const metric_5 = {
		title: "Reuniones reagendadas",
		value: data?.totalRecovered,
		icon: CalendarX,
		percentage: (data?.totalRecovered / data?.totalMeetings) * 100 || 0,
		time,
		color: "orange",
	};
	return (
		<div className="grid xxs:grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
			<MetricCard metric={metric_1} isLoading={isLoading} />
			<MetricCard metric={metric_2} isLoading={isLoading} />
			<MetricCard metric={metric_3} isLoading={isLoading} />
			<MetricCard metric={metric_4} isLoading={isLoading} />
			<MetricCard metric={metric_5} isLoading={isLoading} />
		</div>
	);
}
