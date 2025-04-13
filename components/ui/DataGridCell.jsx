"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Chip from "./chip";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarSearch } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const DataGridCell = ({ column, value, item, user, onUpdate, onReschedule }) => {
	const { toast } = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Si hay un render personalizado, usarlo
	if (column.render) {
		return column.render(value, item);
	}

	const handleUpdateStatus = async (event, col, updateFunction = null, id, newValue) => {
		event.stopPropagation();
		if (!updateFunction || user?.accountType !== "ADMIN") return;
		setIsEditing(true);

		// Verificar que updateFunction sea una función
		if (typeof updateFunction !== "function") {
			toast({
				title: "Error",
				description: `La función para actualizar no está definida.`,
				variant: "destructive",
			});
			setIsEditing(false);
			return;
		}

		try {
			const { error } = await updateFunction(id, newValue);
			if (error) {
				toast({
					title: "Error",
					description: `Ocurrió un error al actualizar la ${item}`,
					variant: "destructive",
				});
			} else {
				toast({
					title: `Estado actualizado correctamente`,
					variant: "success",
				});
				onUpdate?.(item.id, col, newValue);
			}
		} catch (err) {
			toast({
				title: "Error",
				description: `Ocurrió un error inesperado.`,
				variant: "destructive",
			});
		} finally {
			setIsEditing(false);
			setIsDropdownOpen(false);
		}
	};

	// Manejar diferentes tipos de celdas
	switch (column.type) {
		case "date":
			return (
				<div className="flex flex-col">
					{item.recovered && <span className="text-xs text-indigo-400 font-medium">Reagendada</span>}
					<span className="flex items-center gap-2">
						{format(new Date(value.replace("Z", "")), "dd-MM-yyyy", {
							locale: es,
						})}
					</span>
					<span className="text-sm text-muted-foreground">
						{format(new Date(value.replace("Z", "")), "HH:mm", {
							locale: es,
						})}
					</span>
				</div>
			);

		case "chip":
			return <Chip color={column.options[value]}>{column.options[value]?.label || value}</Chip>;

		case "button":
			return isEditing ? (
				<div className="flex justify-center">
					<LoaderCircle className="h-5 w-5 animate-spin text-gray-500 text-center" />
				</div>
			) : (
				<div className="flex justify-center items-center gap-1">
					<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
						<DropdownMenuTrigger asChild>
							<Chip variant="outline" color={column.options[value].color} className="border-0 w-full">
								{column.options[value].label}
							</Chip>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="m-0 p-0">
							<DropdownMenuLabel>{column.header}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{Object.entries(column.options).map(([key, option]) => (
								<DropdownMenuCheckboxItem
									key={key}
									checked={value == option.value}
									className={cn(
										"cursor-pointer opacity-80 hover:opacity-100 transition-colors duration-100 m-1",
										option.value === value && value === null && "bg-yellow-100 text-yellow-900",
										option.value === value && value === true && "bg-green-100 text-green-900",
										option.value === value && value === false && "bg-red-100 text-red-900"
									)}
									onClick={(e) => {
										handleUpdateStatus(
											e,
											column.accessor,
											column.updateFunction?.bind(null) || null,
											item.id,
											option.value
										);
									}}
								>
									{option.label}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					{column.accessor === "held" && item.held === false && user?.accountType !== "EXTERNAL" && (
						<TooltipProvider delayDuration={100}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Chip
										variant="outline"
										color="indigo"
										className="hover:bg-indigo-300 transition-colors duration-100"
										onClick={(e) => {
											e.stopPropagation();
											onReschedule?.(item.id);
										}}
									>
										<CalendarSearch className="h-4 w-4" />
									</Chip>
								</TooltipTrigger>
								<TooltipContent>
									<p>Reagendar</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			);

		case "boolean":
			return <Chip color={value ? "success" : "destructive"}>{value ? "Sí" : "No"}</Chip>;

		case "number":
			return value?.toLocaleString();

		case "currency":
			return new Intl.NumberFormat("es-CL", {
				style: "currency",
				currency: "CLP",
			}).format(value);

		case "percentage":
			return `${value}%`;

		case "text":
		default:
			return value;
	}
};

export default React.memo(DataGridCell);
