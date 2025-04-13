"use client";
import React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Calendar, ListFilter, PlusIcon, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { DatePicker } from "./DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Chip from "./chip";
import Combobox from "./Combobox";
import { filterDateOptions } from "@/lib/utils";
import useFilterStore from "@/app/store/filter";
import { fetchClients } from "@/app/actions/clients";
import { fetchPods } from "@/app/actions/pods";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Checkbox } from "./checkbox";

const DataGridFilters = ({
	onNewClick,
	showNewButton = true,
	filters = null,
	dateFilter = false,
	clientFilter = null,
	podFilter = null,
}) => {
	const {
		searchTerm,
		selectedFilters,
		setSearchTerm,
		updateFilter,
		startDate,
		endDate,
		updateEndDate,
		updateStartDate,
		selectedClient,
		updateSelectedClient,
		selectedPod,
		updateSelectedPod,
	} = useFilterStore();

	const [selectedDateFilter, setSelectedDateFilter] = React.useState("");

	useEffect(() => {
		if (!isLoading && debouncedSearchTerm !== null) {
			inputRef?.current?.focus();
		}
	}, [isLoading, debouncedSearchTerm]);

	const handleDateFilterChange = (value) => {
		setSelectedDateFilter(value);
		if (value === "custom") {
			return;
		} else {
			const option = filterDateOptions.find((opt) => opt.value === value);
			updateStartDate(option.start);
			updateEndDate(option.end);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			{/* Search and Filters Row */}
			<div className="flex flex-col lg:flex-row justify-end flex-1 items-center gap-4">
				{/* Search */}
				<div className="w-full p-0 flex items-center h-full m-1 mr-2">
					<Input
						className="bg-gray-100 w-full h-8 lg:h-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Buscar..."
					/>
				</div>

				{/* Buttons row */}
				<div className="flex items-center gap-2 sm:gap-4 justify-end w-full lg:w-auto">
					{/* Date Filter */}
					{dateFilter && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="bg-gray-100 h-8 sm:h-10 px-2 sm:px-4">
									<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
									<p className="hidden sm:flex">Fecha</p>
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
												onChange={updateStartDate}
												placeholder="Desde"
											/>
											<DatePicker
												value={endDate}
												onChange={updateEndDate}
												placeholder="Hasta"
												disableDatesBefore={startDate}
											/>
										</div>
									)}
								</RadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					{/* Filters */}
					{filters && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="bg-gray-100 h-8 sm:h-10 px-2 sm:px-4">
									<ListFilter className="h-4 w-4 sm:h-5 sm:w-5" />
									<p className="hidden sm:flex">Filtrar</p>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56 p-4 bg-gray-50 flex flex-col gap-4">
								{filters.map((filter) => (
									<div
										key={filter.value}
										className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0"
									>
										<DropdownMenuLabel className="font-semibold text-sm px-0">
											{filter.label}
										</DropdownMenuLabel>
										{filter.options.map((option) => (
											<div className="flex items-center space-x-2" key={option.value}>
												<Checkbox
													id={option?.value?.toString()}
													checked={
														selectedFilters[filter?.value]?.includes(option?.value) || false
													}
													onCheckedChange={(isChecked) =>
														updateFilter(
															filter.value,
															option.value,
															isChecked,
															filter.oneOnly
														)
													}
												/>
												<label className="text-xs font-medium leading-none">
													{option.label}
												</label>
											</div>
										))}
									</div>
								))}

								{/* Client Filter */}
								{clientFilter && user?.accountType !== "EXTERNAL" && (
									<div className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0">
										<DropdownMenuLabel className="font-semibold text-sm px-0">
											Cliente
										</DropdownMenuLabel>
										<Combobox
											label="Cliente"
											items={clientOptions}
											value={selectedClient}
											onChange={updateSelectedClient}
										/>
									</div>
								)}

								{/* Pod Filter */}
								{podFilter && user?.accountType !== "EXTERNAL" && user?.accountType === "ADMIN" && (
									<div className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0">
										<DropdownMenuLabel className="font-semibold text-sm px-0">
											Pod
										</DropdownMenuLabel>
										<Combobox
											label="Pod"
											items={podOptions}
											value={selectedPod}
											onChange={updateSelectedPod}
										/>
									</div>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					{/* New Button */}
					{showNewButton && (
						<Button onClick={onNewClick} className="h-8 sm:h-10 px-2 sm:px-4">
							<PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							<p className="hidden sm:flex">Nuevo</p>
						</Button>
					)}
				</div>
			</div>

			{/* Selected Filters Chips */}
			{filters && (
				<div className="flex gap-4 flex-wrap">
					{Object.entries(selectedFilters).map(([filterGroup, values]) =>
						values
							.filter((value) => value.selected)
							.map((value) => (
								<Chip
									color="indigo"
									key={filterGroup + value.value}
									className="cursor-pointer"
									onClick={() => updateFilter(filterGroup, value.value, false)}
								>
									<div className="flex gap-2 items-center">
										{value.label}
										<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
									</div>
								</Chip>
							))
					)}

					{startDate && (
						<Chip color="orange" className="cursor-pointer" onClick={() => updateStartDate(null)}>
							<div className="flex gap-2 items-center">
								Desde: {format(startDate, "PPP", { locale: es })}
								<X className="h-4 w-4 hover:text-orange-800 hover:scale-105" />
							</div>
						</Chip>
					)}

					{endDate && (
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

export default React.memo(DataGridFilters);
