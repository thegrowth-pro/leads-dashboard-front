"use client";
import { useState, useEffect } from "react";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";
import { fetchClients, deleteClient } from "@/app/actions/clients";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
export default function ClientsPage() {
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const columns = [
		{
			header: "Nombre",
			accessor: "name",
			type: "text",
		},
		{
			header: "Email",
			accessor: "email",
			type: "text",
		},
		{
			header: "Pod asignado",
			accessor: "assignedPod.name",
			type: "text",
		},
	];

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, error } = await fetchClients(searchTerm);
			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los clientes",
					variant: "destructive",
				});
			} else {
				setData(data);
			}
			setIsLoading(false);
		}
		fetchData();
	}, [debouncedSearchTerm]);

	const handleRowClick = (id) => {
		router.push(`/clients/${id}`);
	};

	const handleDelete = (id) => {
		openDialog({
			title: "Eliminar Cliente",
			description: "¿Estás seguro de que deseas eliminar este cliente?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await deleteClient(id);
				if (error) {
					toast({
						title: "Error",
						description: "No se pudo eliminar el cliente",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Cliente eliminado correctamente",
						variant: "success",
					});
					setData(data.filter((client) => client.id !== id));
				}
				setIsLoading(false);
			}
		});
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
			>
				<DataGridHeader
					title="Clientes"
					itemName="Cliente"
					count={data.length}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					isLoading={isLoading}
					onNewClick={() => router.push("/clients/new")}
				/>
			</BaseDataGrid>

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
