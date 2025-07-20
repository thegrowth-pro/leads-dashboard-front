"use client";
import { useState, useEffect } from "react";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";
import { fetchPods, deletePod } from "@/app/actions/pods";
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

export default function PodsPage() {
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const { selectedFilters, updateFilter } = useFilterStore();

	const columns = [
		{
			header: "Nombre",
			accessor: "name",
			type: "text",
		},
		{
			header: "Manager",
			accessor: "manager.name",
			type: "text",
		},
	];

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, error } = await fetchPods(searchTerm, selectedFilters);
			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los pods",
					variant: "destructive",
				});
			} else {
				setData(data);
			}
			setIsLoading(false);
		}
		fetchData();
	}, [debouncedSearchTerm, selectedFilters]);

	const handleRowClick = (id) => {
		router.push(`/pods/${id}`);
	};

	const handleDelete = (id) => {
		openDialog({
			title: "Eliminar Pod",
			description: "¿Estás seguro de que deseas eliminar este pod?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await deletePod(id);
				if (error) {
					toast({
						title: "Error",
						description: "No se pudo eliminar el pod",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Pod eliminado correctamente",
						variant: "success",
					});
					setData(data.filter((pod) => pod.id !== id));
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
					title="Pods"
					itemName="Pod"
					count={data.length}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					isLoading={isLoading}
					onNewClick={() => router.push("/pods/new")}
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
