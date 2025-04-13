"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TimePicker({ value, onChange }) {
	// Inicializamos a partir de value o valores por defecto
	const [hour, setHour] = useState(value ? value.split(":")[0] : "12");
	const [minute, setMinute] = useState(value ? value.split(":")[1] : "00");
	const [open, setOpen] = useState(false);

	// Actualiza el estado interno cuando la prop value cambie
	useEffect(() => {
		if (value) {
			const [propHour, propMinute] = value.split(":");
			if (propHour && propMinute) {
				setHour(propHour);
				setMinute(propMinute);
			}
		}
	}, [value]);

	// Generar arrays para horas y minutos
	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
	const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

	const handleConfirm = () => {
		setOpen(false);
		if (onChange) {
			onChange(`${hour}:${minute}`);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild className="w-full">
				<Button
					variant="secondary"
					className={cn(
						"w-full justify-start text-left font-normal m-0 bg-white border-b border-gray-300 hover:bg-indigo-200",
						!hour && "text-muted-foreground"
					)}
				>
					<Clock className="mr-2 h-4 w-4" />
					{hour && minute ? (
						<span>
							{hour}:{minute}
						</span>
					) : (
						<span>Seleccionar hora</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[240px] p-4 bg-white shadow-2xl ">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium">Seleccionar hora</h4>
						<div className="grid grid-cols-2 gap-2">
							<div className="flex flex-col space-y-1">
								<Label htmlFor="hours">Horas</Label>
								<Select value={hour} onValueChange={(value) => setHour(value)}>
									<SelectTrigger id="hours">
										<SelectValue placeholder="Hora" />
									</SelectTrigger>
									<SelectContent position="popper" className="max-h-[200px]">
										{hours.map((h) => (
											<SelectItem key={h} value={h}>
												{h}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col space-y-1">
								<Label htmlFor="minutes">Minutos</Label>
								<Select value={minute} onValueChange={(value) => setMinute(value)}>
									<SelectTrigger id="minutes">
										<SelectValue placeholder="Minuto" />
									</SelectTrigger>
									<SelectContent position="popper" className="max-h-[200px]">
										{minutes.map((m) => (
											<SelectItem key={m} value={m}>
												{m}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<Button onClick={handleConfirm} className="w-full">
						Seleccionar hora
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
