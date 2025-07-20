"use client";
import React, { useRef, useEffect, useState, use } from "react";
import { format, set } from "date-fns";
import useFilterStore from "@/app/store/filter";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
	Calendar,
	CalendarCog,
	CalendarSearch,
	CalendarSync,
	CircleAlert,
	Edit,
	Ellipsis,
	Frown,
	ListFilter,
	LoaderCircle,
	PlusIcon,
	Rocket,
	Trash2,
	TriangleAlert,
	X,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import Chip from "./ui/chip";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import useDebounce from "@/hooks/useDebounce";
import PaginationComponent from "./ui/PaginationComponent";
import { DatePicker } from "./ui/DatePicker";
import { es, se } from "date-fns/locale";
import Combobox from "./ui/Combobox";
import { fetchClients } from "@/app/actions/clients";
import { cn, filterDateOptions } from "@/lib/utils";
import { fetchPods } from "@/app/actions/pods";
import RescheduleModal from "@/app/(main)/meetings/RescheduleModal";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const DataGrid = ({
	label,
	item,
	search,
	filters,
	pagination,
	columns,
	fetchDataAction,
	deleteItemAction, // Server Action para eliminar el ítem,
	dialogComponent: DialogComponent, // Componente para el Dialog,
	dateFilter,
	clientFilter,
	podFilter,
	user,
	rowClick = true,
}) => {
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

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
		selectedDateFilter,
		updateSelectedDateFilter,
	} = useFilterStore();

	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedItemId, setSelectedItemId] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
	const [refreshData, setRefreshData] = useState(false);
	const [rowDropdownOpen, setRowDropdownOpen] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300 ms de debounce
	const inputRef = useRef(null);
	const [isEditing, setIsEditing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [clientOptions, setClientOptions] = useState([]);
	const [podOptions, setPodOptions] = useState([]);
	const [meetingToReschedule, setMeetingToReschedule] = useState(null);
	const [isChangeStatusDropdownOpen, setIsChangeStatusDropdownOpen] = useState({ id: null, col: null });

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, count, error } = await fetchDataAction(
				searchTerm,
				selectedFilters,
				currentPage,
				startDate,
				endDate,
				selectedClient,
				selectedPod
			);
			setData(data);
			if (pagination) {
				setTotalPages(Math.ceil(count / 10));
			}
			setIsLoading(false);
		}
		selectedFilters && debouncedSearchTerm !== null && fetchData();
	}, [
		selectedFilters,
		refreshData,
		debouncedSearchTerm,
		currentPage,
		startDate,
		endDate,
		selectedClient,
		selectedPod,
	]);

	useEffect(() => {
		if (!isLoading && debouncedSearchTerm !== null) {
			inputRef?.current?.focus();
		}
	}, [isLoading, debouncedSearchTerm]);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedFilters, debouncedSearchTerm, startDate, endDate, selectedClient, selectedPod]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [totalPages]);

	useEffect(() => {
		const fetchOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchClients();
			const { data: podData } = await fetchPods();
			setClientOptions(data);
			setPodOptions(podData);

			setIsLoading(false);
		};
		if (clientFilter && user?.accountType !== "EXTERNAL") {
			fetchOptions();
		}
	}, []);

	const handleRowClick = (id) => {
		if (!rowClick) return;
		setRowDropdownOpen(false);
		setSelectedItemId(id);
		setModalOpen(true);
	};

	// Manejo de eliminación
	const handleDelete = (id) => {
		setRowDropdownOpen(false);
		
		openDialog({
			title: `Eliminar ${item}`,
			description: `¿Estás seguro de que deseas eliminar este/a ${item}?`,
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				if (id) {
					const { error } = await deleteItemAction(id);
					if (error) {
						toast({
							title: "Error",
							description: `Ocurrió un error al eliminar el/la ${item}`,
							variant: "destructive",
						});
						setIsLoading(false);
					} else {
						toast({
							title: `${item} eliminado/a correctamente`,
							variant: "success",
						});
						setIsLoading(false);
						setRefreshData(!refreshData);
					}
				}
			}
		});
	};

	const handleChipClick = async (event, col, updateFunction = null, id, value) => {
		event.stopPropagation();
		if (!updateFunction || user?.accountType !== "ADMIN") return;
		setIsChangeStatusDropdownOpen({ id, col, value });
	};

	const handleUpdateStatus = async (event, col, updateFunction = null, id, newValue) => {
		event.stopPropagation();
		if (!updateFunction || user?.accountType !== "ADMIN") return;
		setIsEditing({ col, id });

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
					title: `${item} actualizada correctamente`,
					variant: "success",
				});
				setData((prevData) =>
					prevData.map((row) => {
						if (row.id === id) {
							return { ...row, [col]: newValue };
						}
						return row;
					})
				);
			}
		} catch (err) {
			toast({
				title: "Error",
				description: `Ocurrió un error inesperado.`,
				variant: "destructive",
			});
		} finally {
			setIsEditing(false);
			setIsChangeStatusDropdownOpen({ id: null, col: null, value: null });
		}
	};

	const handleDateFilterChange = (value) => {
		updateSelectedDateFilter(value);
		if (value === "custom") {
			return;
		} else {
			updateStartDate(filterDateOptions.find((option) => option.value === value).start);
			updateEndDate(filterDateOptions.find((option) => option.value === value).end);
		}
	};

	if (isLoading || !data) {
		return (
			<div className="text-center w-full text-gray-400 flex flex-col gap-2 items-center py-4 self-center justify-center">
				<Rocket className="size-6 animate-bounce " />
				<p>Cargando...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 overflow-y-auto">
			{/* Header */}
			<div className="flex justify-between lg:items-center sm:gap-20 gap-4">
				{/* Title */}
				<div>
					<h2 className="font-semibold lg:text-2xl">{label}</h2>
					<p className="text-gray-400 text-xs">
						Mostrando {data?.length} {data?.length === 1 ? item.toLowerCase() : label.toLowerCase()}
					</p>
				</div>

				{/* Search, Filters, New */}
				<div className="flex flex-col lg:flex-row justify-end flex-1 items-center gap-4">
					{/* Search - Full width on mobile */}
					{search && (
						<div className="w-full p-0 flex items-center h-full m-1 mr-2">
							<Input
								ref={inputRef}
								className="bg-gray-100 w-full h-8 lg:h-10"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar..."
							/>
						</div>
					)}

					{/* Buttons row - Compact on mobile */}
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
															selectedFilters[filter?.value]?.includes(option?.value) ||
															false
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
						{user?.accountType !== "EXTERNAL" && (
							<Button
								onClick={() => {
									setSelectedItemId(null);
									setModalOpen(true);
								}}
								className="h-8 sm:h-10 px-2 sm:px-4"
							>
								<PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
								<p className="hidden sm:flex">Nuevo</p>
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Selected Filters */}
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
									filters.find((f) => f.value === filterGroup).options?.find((o) => o.value === value)
										.label
								}

								<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
							</div>
						</Chip>
					))
				)}

				{selectedClient && (
					<Chip color="indigo" className="cursor-pointer" onClick={() => updateSelectedClient(null)}>
						<div className="flex gap-2 items-center">
							{clientOptions.find((client) => client.id === selectedClient)?.name}
							<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
						</div>
					</Chip>
				)}

				{selectedPod && (
					<Chip color="indigo" className="cursor-pointer" onClick={() => updateSelectedPod(null)}>
						<div className="flex gap-2 items-center">
							{podOptions.find((pod) => pod.id === selectedPod)?.name}
							<X className="h-4 w-4 hover:text-indigo-800 hover:scale-105" />
						</div>
					</Chip>
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

			{/* Table */}
			{data?.length === 0 ? (
				<div className="text-center text-gray-400 flex flex-col gap-2 items-center py-4 max-w-96 self-center">
					{isLoading ? (
						<p>Cargando...</p>
					) : (
						<p className="text-sm">
							No se encontraron {label.toLowerCase()}, ajusta los filtros o el campo de búsqueda
						</p>
					)}
				</div>
			) : (
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow className="hover:bg-gray-100">
							{columns.map((col) => (
								<TableHead
									className={cn(
										col.type === "button" ? "text-center" : "",
										col.hideOnMobile && "hidden lg:table-cell"
									)}
									key={col.accessor}
								>
									{col.header}
								</TableHead>
							))}
							<TableHead className="text-center hidden lg:table-cell">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.map((item) => (
							<TableRow className="cursor-pointer" key={item.id}>
								{columns.map((col) => {
									const value = col.accessor.split(".").reduce((o, i) => (o ? o[i] : ""), item);

									return (
										<TableCell
											key={col.accessor}
											onClick={() => {
												handleRowClick(item.id);
											}}
											className={cn(
												col.type === "button" ? "text-center" : "",
												col.hideOnMobile && "hidden lg:table-cell"
											)}
										>
											{col.type === "chip" ? (
												<Chip color={col.options[value]}>{value}</Chip>
											) : col.type === "date" ? (
												// fecha chile
												<div className="flex flex-col">
													{item.recovered && (
														<span className="text-xs text-indigo-400 font-medium">
															Reagendada
														</span>
													)}
													<span className="flex items-center gap-2">
														{format(new Date(value), "dd-MM-yyyy", {
															locale: es,
														})}
													</span>
													<span className="text-sm text-muted-foreground">
														{format(new Date(value), "HH:mm", {
															locale: es,
														})}
													</span>
												</div>
											) : col.type === "button" ? (
												isEditing.col === col.accessor && isEditing.id === item.id ? (
													<div className="flex justify-center">
														<LoaderCircle className="h-5 w-5 animate-spin text-gray-500 text-center" />
													</div>
												) : (
													<div className="flex justify-center items-center gap-1">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Chip
																	variant="outline"
																	color={col.options[value].color}
																	className="border-0 w-full"
																	onClick={(e) => {
																		handleChipClick(
																			e,
																			col.accessor,
																			col.updateFunction?.bind(null) || null,
																			item.id,
																			value
																		);
																	}}
																>
																	{col.options[value].label}
																</Chip>
															</DropdownMenuTrigger>
															<DropdownMenuContent className="m-0 p-0">
																<DropdownMenuLabel>{col.header}</DropdownMenuLabel>
																<DropdownMenuSeparator />
																{Object.entries(col.options).map(([key, option]) => (
																	<DropdownMenuCheckboxItem
																		key={key}
																		checked={value == option.value}
																		className={cn(
																			"cursor-pointer opacity-80 hover:opacity-100 transition-colors duration-100 m-1",
																			option.value === value &&
																				value === null &&
																				"bg-yellow-100 text-yellow-900",
																			option.value === value &&
																				value === true &&
																				"bg-green-100 text-green-900",
																			option.value === value &&
																				value === false &&
																				"bg-red-100 text-red-900"
																		)}
																		onClick={(e) => {
																			handleUpdateStatus(
																				e, // event
																				col.accessor,
																				col.updateFunction?.bind(null) || null,
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
														{col.accessor === "held" &&
															item.held === false &&
															user.accountType !== "EXTERNAL" && (
																<TooltipProvider delayDuration={100}>
																	<Tooltip>
																		<TooltipTrigger
																			asChild
																			onClick={(e) => {
																				e.stopPropagation();
																				setMeetingToReschedule(item.id);
																				setRescheduleModalOpen(true);
																			}}
																		>
																			<Chip
																				variant="outline"
																				color="indigo"
																				className="hover:bg-indigo-300 transition-colors duration-100"
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
												)
											) : (
												value
											)}
										</TableCell>
									);
								})}

								<TableCell className="hidden justify-center  lg:table-cell">
									<DropdownMenu open={rowDropdownOpen === item.id} onOpenChange={setRowDropdownOpen}>
										<DropdownMenuTrigger asChild className="flex justify-center h-10">
											<Ellipsis
												className="text-gray-500 cursor-pointer hover:text-gray-700"
												onClick={() => setRowDropdownOpen(item.id)}
											/>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="p-2 bg-gray-50 flex flex-col gap-2">
											{item.held === false && (
												<DropdownMenuItem asChild>
													<div
														className="flex gap-4 text-sm items-center hover:text-primary border-b border-gray-100 pb-2 cursor-pointer bg-primary text-primary-foreground"
														onClick={() => {
															setMeetingToReschedule(item.id);
															setRescheduleModalOpen(true);
														}}
													>
														<CalendarSearch className="h-4 w-4" />
														<p>Reagendar</p>
													</div>
												</DropdownMenuItem>
											)}

											{rowClick && (
												<DropdownMenuItem asChild>
													<div
														className="flex gap-4 text-sm items-center hover:text-primary border-b border-gray-100 pb-2 cursor-pointer"
														onClick={() => {
															handleRowClick(item.id);
														}}
													>
														<Edit className="h-4 w-4" />
														<p>
															{user?.accountType === "EXTERNAL"
																? "Ver/Dejar comentarios"
																: "Ver/Editar"}
														</p>
													</div>
												</DropdownMenuItem>
											)}

											{user?.accountType !== "EXTERNAL" && (
												<DropdownMenuItem asChild>
													<div
														className="flex gap-4 text-sm items-center justify-between hover:underline hover:text-primary cursor-pointer"
														onClick={() => {
															handleDelete(item.id);
														}}
													>
														<div className="flex gap-4 items-center">
															<Trash2 className="h-4 w-4" />
															<p>Eliminar</p>
														</div>
														<CircleAlert className="h-4 w-4 text-red-300 text-right" />
													</div>
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					{/* Pagination */}

					{pagination && (
						<TableFooter className="bg-gray-100">
							<TableRow className>
								<TableCell className="text-right" colSpan={columns.length + 1}>
									<PaginationComponent
										currentPage={currentPage}
										totalPages={totalPages}
										onPageChange={setCurrentPage}
									/>
								</TableCell>
							</TableRow>
						</TableFooter>
					)}
				</Table>
			)}
			{/* Dialog */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="p-0 ">
					<DialogHeader className="hidden">
						<DialogTitle>{selectedItemId ? `Editar ${item}` : `Nuevo ${item}`}</DialogTitle>
						<DialogDescription>
							{selectedItemId ? "Modifica los campos necesarios" : "Completa los campos necesarios"}
						</DialogDescription>
					</DialogHeader>

					{DialogComponent && (
						<DialogComponent
							user={user}
							refreshData={() => setRefreshData(!refreshData)}
							id={selectedItemId}
							onClose={() => {
								setModalOpen(false);
								setSelectedItemId(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>

			{meetingToReschedule && (
				<Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
					<DialogContent className="flex flex-col gap-6 pt-6" asChild>
						<DialogHeader>
							<DialogTitle>Reagendar reunión</DialogTitle>
							<DialogDescription>
								Selecciona una nueva fecha y hora para reagendar la reunión.
							</DialogDescription>
						</DialogHeader>

						<RescheduleModal
							meetingId={meetingToReschedule}
							open={true}
							onClose={() => setRescheduleModalOpen(false)}
							onOpenChange={setRescheduleModalOpen}
							refreshData={() => setRefreshData(!refreshData)}
						/>
					</DialogContent>
				</Dialog>
			)}

			{/* Modal de confirmación de eliminación */}
			<ConfirmDialog
				isOpen={isOpen}
				onClose={closeDialog}
				onConfirm={handleConfirm}
				title={dialogConfig.title}
				description={dialogConfig.description}
				confirmText={dialogConfig.confirmText}
			/>
		</div>
	);
};

export default React.memo(DataGrid);
