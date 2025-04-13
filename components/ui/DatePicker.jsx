"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimePicker from "./TimePicker";

export function DatePicker({
	label,
	value,
	onChange,
	placeholder = "Pick a date",
	className = "",
	buttonVariant = "outline",
	buttonClassName = "",
	calendarProps = {},
	disabled,
	disableDatesBefore,
	timePicker = false,
	sideOffset = 0,
}) {
	// Estado para la fecha y la hora (la hora se usa solo si timePicker es true)
	const [date, setDate] = useState(value || null);
	const [time, setTime] = useState(value ? format(value, "HH:mm") : "12:00");
	const [open, setOpen] = useState(false);

	// Combina la fecha y la hora solo si timePicker es true; de lo contrario, retorna la fecha tal cual.
	const combineDateAndTime = (d, t) => {
		if (!timePicker) return d;
		const [hours, minutes] = t.split(":").map(Number);
		const newDate = new Date(d);
		newDate.setHours(hours, minutes, 0, 0);
		return newDate;
	};

	// Al seleccionar una nueva fecha en el calendario.
	const handleDateChange = (newDate) => {
		setDate(newDate);
		const newValue = combineDateAndTime(newDate, time);
		if (onChange) {
			onChange(newValue);
		}
	};

	// Al cambiar la hora desde el TimePicker.
	const handleTimeChange = (newTime) => {
		setTime(newTime);
		if (date) {
			const newValue = combineDateAndTime(date, newTime);
			if (onChange) {
				onChange(newValue);
			}
		}
	};

	return (
		<div className="flex flex-col min-w-[255px] gap-1">
			{label && (
				<label className="text-sm font-medium text-muted-foreground px-1">
					Fecha{timePicker ? " y hora" : ""} local*
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild className="w-full">
					<Button
						variant={buttonVariant}
						disabled={disabled}
						className={cn(
							"justify-start text-left font-normal w-full",
							!date && "text-muted-foreground",
							buttonClassName
						)}
					>
						<CalendarIcon className="mr-1 h-4 w-4 text-gray-500" />
						{date ? (
							timePicker ? (
								format(combineDateAndTime(date, time), "PPP - HH:mm", { locale: es })
							) : (
								format(date, "PPP", { locale: es })
							)
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className={cn("w-auto p-0", className)} sideOffset={sideOffset}>
					<div className="flex flex-col">
						{/* Renderiza el TimePicker solo si timePicker es true */}
						{timePicker && <TimePicker value={time} onChange={handleTimeChange} />}
						<Calendar
							mode="single"
							selected={date}
							onSelect={handleDateChange}
							initialFocus
							locale={es}
							disable={{ before: disableDatesBefore }}
							{...calendarProps}
						/>
						<Button className="w-full" onClick={(e) => {
							e.preventDefault();
							setOpen(false);
						}}>
							Confirmar
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
