"use client";
import { useState, useEffect } from "react";
import {
	fetchMeetings,
	deleteMeeting,
	updateMeetingValidatedStatus,
	updateMeetingHeldStatus,
	rescheduleMeeting,
} from "@/app/actions/meetings";
import { fetchClients } from "@/app/actions/clients";
import { fetchPods } from "@/app/actions/pods";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import useFilterStore from "@/app/store/filter";
import useSessionStore from "@/app/store/session";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RescheduleModal from "./RescheduleModal";
import Combobox from "@/components/ui/Combobox";
export default function MeetingsPage() {
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const { session } = useSessionStore();

	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const [meetingToReschedule, setMeetingToReschedule] = useState(null);
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
	const [refreshData, setRefreshData] = useState(false);
	const [clientOptions, setClientOptions] = useState([]);
	const [podOptions, setPodOptions] = useState([]);
	const {
		selectedFilters,
		updateFilter,
		selectedPod,
		selectedClient,
		startDate,
		endDate,
		updateSelectedPod,
		updateSelectedClient,
		_hasHydrated,
	} = useFilterStore();

	const columns = [
		{ header: "Cliente", accessor: "client.name", reschedule: true, rescheduleAccessor: "held" },
		{ header: "País", accessor: "country.name", hideOnMobile: true },
		{ header: "Fecha", accessor: "date", type: "date" },
		{ header: "Empresa", accessor: "prospect" },
		{ header: "Pod", accessor: "pod.name", hideOnMobile: true },
		{ header: "SDR", accessor: "sdr.name", hideOnMobile: true },
		{
			header: "Realizada?",
			accessor: "held",
			type: "button",
			updateFunction: updateMeetingHeldStatus,
			options: {
				null: { label: "Pendiente", color: "yellow", value: null },
				true: { label: "Sí", color: "green", value: true },
				false: { label: "No", color: "red", value: false },
			},
			onReschedule: async (id, newDate) => {
				const { error } = await rescheduleMeeting(id, newDate);
				if (error) {
					toast({
						title: "Error",
						description: "No se pudo reagendar la reunión",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Reunión reagendada correctamente",
						variant: "success",
					});
					// Refresh the data
					const { data, error } = await fetchMeetings(
						searchTerm,
						selectedFilters,
						page,
						startDate,
						endDate,
						selectedClient,
						selectedPod
					);
					if (!error) {
						setData(data);
					}
				}
			},
		},
		{
			header: "Validada?",
			accessor: "validated",
			type: "button",
			updateFunction: updateMeetingValidatedStatus,
			options: {
				null: { label: "Pendiente", color: "yellow", value: null },
				true: { label: "Si", color: "green", value: true },
				false: { label: "No", color: "red", value: false },
			},
		},
		// { header: "Inbox", accessor: "inbox" },
	];

	const filters = [
		{
			label: "Realizada?",
			value: "held",
			oneOnly: true,
			options: [
				{ value: null, label: "Pendiente" },
				{ value: true, label: "Realizada" },
				{ value: false, label: "No realizada" },
			],
		},

		{
			label: "Valida?",
			value: "validated",
			oneOnly: true,
			options: [
				{ value: null, label: "Pendiente" },
				{ value: true, label: "Validada" },
				{ value: false, label: "Rechazada" },
			],
		},
	];

	useEffect(() => {
		const fetchOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchClients();
			const { data: podData } = await fetchPods();
			setClientOptions(data);
			setPodOptions(podData);

			setIsLoading(false);
		};
		if (session?.accountType !== "EXTERNAL") {
			fetchOptions();
		}
	}, []);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, count, error } = await fetchMeetings(
				searchTerm,
				selectedFilters,
				page,
				startDate,
				endDate,
				selectedClient,
				selectedPod
			);

			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar las reuniones",
					variant: "destructive",
				});
			} else {
				setData(data);
				setTotalPages(Math.ceil(count / 10));
			}
			setIsLoading(false);
		}
		selectedFilters && debouncedSearchTerm !== null && _hasHydrated && fetchData();
	}, [
		selectedFilters,
		refreshData,
		debouncedSearchTerm,
		startDate,
		endDate,
		selectedClient,
		selectedPod,
		_hasHydrated,
		page,
	]);

	const handleRowClick = (id) => {
		router.push(`/meetings/${id}`);
	};

	const handleDelete = (id) => {
		openDialog({
			title: "Eliminar Reunión",
			description: "¿Estás seguro de que deseas eliminar esta reunión?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await deleteMeeting(id);
				if (error) {
					toast({
						title: "Error",
						description: "No se pudo eliminar la reunión",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Reunión eliminada correctamente",
						variant: "success",
					});
					setData(data.filter((meeting) => meeting.id !== id));
				}
				setIsLoading(false);
			}
		});
	};

	const handleUpdate = async (id, column, newValue) => {
		setData((prevData) =>
			prevData.map((row) => {
				if (row.id === id) {
					return { ...row, [column]: newValue };
				}
				return row;
			})
		);
	};

	const handleReschedule = (id) => {
		setMeetingToReschedule(id);
		setRescheduleModalOpen(true);
	};

	return (
		<div className="m-4 p-4 flex flex-col gap-4 bg-gray-50 border-2 border-gray-300 rounded-xl shadow-gray-400">
			<BaseDataGrid
				columns={columns}
				data={data}
				isLoading={isLoading}
				onRowClick={handleRowClick}
				onEdit={handleRowClick}
				onDelete={handleDelete}
				user={session}
				onUpdate={handleUpdate}
				onReschedule={handleReschedule}
				pagination={true}
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
			>
				<DataGridHeader
					title="Reuniones"
					itemName="Reunión"
					count={data.length}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					isLoading={isLoading}
					onNewClick={() => router.push("/meetings/new")}
					filters={filters}
					clientOptions={clientOptions}
					podOptions={podOptions}
					showNewButton={session?.accountType !== "EXTERNAL"}
					showDateFilter={true}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="bg-gray-100 ">
								<ListFilter className="h-4 w-4" />
								<p className="hidden md:flex">Filtrar</p>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56 p-4 bg-gray-50 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
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
													updateFilter(filter.value, option.value, isChecked, filter.oneOnly)
												}
											/>
											<label className="text-xs font-medium leading-none">{option.label}</label>
										</div>
									))}
								</div>
							))}
							{/* Client Filter */}
							{session?.accountType !== "EXTERNAL" && (
								<div className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0">
									<DropdownMenuLabel className="font-semibold text-sm px-0">
										Cliente
									</DropdownMenuLabel>
									<Combobox
										items={clientOptions}
										value={selectedClient}
										onChange={updateSelectedClient}
									/>
								</div>
							)}

							{/* Pod Filter */}
							{session?.accountType !== "EXTERNAL" && session?.accountType === "ADMIN" && (
								<div className="flex flex-col gap-2 border-b border-gray-200 pb-4 last:border-0">
									<DropdownMenuLabel className="font-semibold text-sm px-0">Pod</DropdownMenuLabel>
									<Combobox items={podOptions} value={selectedPod} onChange={updateSelectedPod} />
								</div>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</DataGridHeader>
			</BaseDataGrid>

			{meetingToReschedule && (
				<Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
					<DialogContent>
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
}
