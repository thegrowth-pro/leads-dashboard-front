"use client";
import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { PlusIcon, X, Calendar } from "lucide-react";
import useFilterStore from "@/app/store/filter";
import Chip from "./chip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { DatePicker } from "./DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { filterDateOptions } from "@/lib/utils";

const DataGridHeader = ({
	title,
	itemName,
	count,
	searchTerm,
	onSearchChange,
	onNewClick,
	showSearch = true,
	showNewButton = true,
	showDateFilter = false,
	isLoading,
	filters,
	children,
	clientOptions,
	podOptions,
}) => {
	const {
		selectedFilters,
		updateFilter,
		selectedClient,
		selectedPod,
		startDate,
		endDate,
		updateStartDate,
		updateEndDate,
		updateSelectedClient,
		updateSelectedPod,
		selectedDateFilter,
		updateSelectedDateFilter,
	} = useFilterStore();

	const handleDateFilterChange = (value) => {
		updateSelectedDateFilter(value);
		if (value !== "custom") {
			updateStartDate(filterDateOptions.find((option) => option.value === value).start);
			updateEndDate(filterDateOptions.find((option) => option.value === value).end);
		}
	};

	const selectedPodName = podOptions?.find((pod) => pod.id === selectedPod)?.name;
	const selectedClientName = clientOptions?.find((client) => client.id === selectedClient)?.name;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row gap-4 justify-between">
				{/* Primera fila: Título y contador */}
				<div className="flex justify-between items-start">
					<div>
						<h2 className="font-semibold text-2xl">{title}</h2>
						{!isLoading && (
							<p className="text-gray-400 text-xs">
								Mostrando {count} {count === 1 ? itemName.toLowerCase() : title.toLowerCase()}
							</p>
						)}
					</div>
				</div>

				{/* Segunda fila: Búsqueda y botones */}
				<div className="flex gap-4 justify-end flex-col lg:flex-row w-full">
					{showSearch && (
						<Input
							type="text"
							className="w-full"
							placeholder={`Buscar ${itemName.toLowerCase()}...`}
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					)}
					<div className="flex gap-4 justify-end w-full md:w-auto">
						{showDateFilter && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className={cn("bg-gray-100 w-full justify-start")}>
										<Calendar className="h-4 w-4" />
										<p className="">
											{selectedDateFilter && startDate && endDate
												? filterDateOptions.find(
														(option) => option.value === selectedDateFilter
												  ).label
												: "Fechas"}
										</p>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-auto p-4 bg-gray-50 flex flex-col gap-4">
									<RadioGroup
										className="flex flex-col gap-3"
										value={selectedDateFilter}
										onValueChange={handleDateFilterChange}
									>
										{filterDateOptions.map((option) => (
											<div className="flex items-center space-x-3" key={option.value}>
												<RadioGroupItem value={option.value} id={option.value} />
												<Label htmlFor={option.value}>{option.label}</Label>
											</div>
										))}

										{selectedDateFilter === "custom" && (
											<div className="flex flex-col gap-2">
												<DatePicker
													value={startDate}
													onChange={(value) =>
														updateStartDate(new Date(new Date(value).setHours(0, 0, 0, 0)))
													}
													placeholder="Desde"
												/>
												<DatePicker
													value={endDate}
													onChange={(value) =>
														updateEndDate(
															new Date(new Date(value).setHours(23, 59, 59, 999))
														)
													}
													placeholder="Hasta"
													disableDatesBefore={startDate}
												/>
											</div>
										)}
									</RadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{children}

						{showNewButton && (
							<Button onClick={onNewClick} className="flex">
								<PlusIcon className="h-4 w-4" />
								<p className="hidden md:flex">Crear {itemName}</p>
							</Button>
						)}
					</div>
				</div>

				{/* Filtrados */}
			</div>
			{!isLoading && (
				<div className="flex gap-4">
					{Object.entries(selectedFilters).map(([filterGroup, values]) =>
						values.map((value) => (
							<Chip
								color="indigo"
								key={filterGroup + value}
								className="cursor-pointer"
								onClick={() => updateFilter(filterGroup, value, false)}
							>
								<div className="flex gap-2 items-center">
									{
										filters
											.find((f) => f.value === filterGroup)
											.options?.find((o) => o.value === value).label
									}

									<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
								</div>
							</Chip>
						))
					)}

					{selectedClient && selectedClientName && (
						<Chip color="indigo" className="cursor-pointer" onClick={() => updateSelectedClient(null)}>
							<div className="flex gap-2 items-center">
								{selectedClientName}
								<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
							</div>
						</Chip>
					)}

					{selectedPod && selectedPodName && (
						<Chip color="indigo" className="cursor-pointer" onClick={() => updateSelectedPod(null)}>
							<div className="flex gap-2 items-center">
								{selectedPodName}
								<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
							</div>
						</Chip>
					)}

					{selectedDateFilter !== "custom" && selectedDateFilter !== "" && selectedDateFilter && (
						<Chip
							color="orange"
							className="cursor-pointer"
							onClick={() => {
								updateStartDate(null);
								updateEndDate(null);
								updateSelectedDateFilter("");
							}}
						>
							<div className="flex gap-2 items-center">
								{selectedDateFilter === "today"
									? "Hoy"
									: selectedDateFilter === "thisMonth"
									? "Este mes"
									: selectedDateFilter === "lastMonth"
									? "Mes pasado"
									: selectedDateFilter === "thisYear"
									? "Este año"
									: selectedDateFilter === "custom"
									? "Custom"
									: selectedDateFilter === "allways"
									? "Desde siempre"
									: "Custom"}
								<X className="h-4 w-4 hover:text-orange-800 hover:scale-105" />
							</div>
						</Chip>
					)}

					{startDate && selectedDateFilter === "custom" && (
						<Chip color="orange" className="cursor-pointer" onClick={() => updateStartDate(null)}>
							<div className="flex gap-2 items-center">
								Desde: {format(startDate, "PPP", { locale: es })}
								<X className="h-4 w-4 hover:text-orange-800 hover:scale-105" />
							</div>
						</Chip>
					)}

					{endDate && selectedDateFilter === "custom" && (
						<Chip color="orange" className="cursor-pointer" onClick={() => updateEndDate(null)}>
							<div className="flex gap-2 items-center">
								Hasta: {format(endDate, "PPP", { locale: es })}
								<X className="h-4 w-4 hover:text-orange-800 hover:scale-105" />
							</div>
						</Chip>
					)}
				</div>
			)}
		</div>
	);
};

export default React.memo(DataGridHeader);
