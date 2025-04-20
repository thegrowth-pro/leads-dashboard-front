"use client";

import { useState } from "react";

import { DatePicker } from "@/components/ui/DatePicker";
import { rescheduleMeeting } from "@/app/actions/meetings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { formatDatetoISO } from "@/lib/utils";
export default function RescheduleModal({ refreshData, onClose, meetingId }) {
	const [newDate, setNewDate] = useState();
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleReschedule = async () => {
		setLoading(true);
		const newDateISO = formatDatetoISO(newDate);
		const { error } = await rescheduleMeeting(meetingId, newDateISO);

		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al reagendar la reunión",
				variant: "destructive",
			});
			setLoading(false);
		} else {
			toast({
				title: "Reunión actualizada",
				description: "La reunión ha sido reagendada exitosamente.",
				variant: "success",
			});
			setLoading(false);
			onClose();
			refreshData();
		}
	};

	return (
		<div className="flex flex-col w-full gap-4 ">
			<DatePicker
				// label
				value={newDate}
				onChange={setNewDate}
				placeholder="Selecciona una nueva fecha y hora"
				buttonClassName="custom-button-styles"
				calendarProps={{ minDate: new Date() }}
				timePicker={true}
				className="w-full"
				align="end"
				sideOffset={-150}
			/>
			<div className="flex justify-end gap-4 w-full">
				<Button onClick={handleReschedule} disabled={!newDate || loading}>
					{loading ? (
						<div className="flex gap-2 items-center">
							<Loader className="w-6 h-6 animate-spin" />
							Cargando...
						</div>
					) : (
						"Reagendar"
					)}
				</Button>
			</div>
		</div>
	);
}
