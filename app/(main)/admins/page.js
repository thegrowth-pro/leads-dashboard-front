"use client";
import { useState, useEffect } from "react";

import { fetchAdmins, deleteAdmin } from "@/app/actions/admins";
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";

export default function UsersPage() {
	const { toast } = useToast();
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const columns = [{ header: "Email", accessor: "email" }];

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, error } = await fetchAdmins(searchTerm);
			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los administradores",
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
		router.push(`/admins/${id}`);
	};

	const handleDelete = async (id) => {
		setIsLoading(true);
		const { error } = await deleteAdmin(id);
		if (error) {
			toast({
				title: "Error",
				description: "No se pudo eliminar el administrador",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Administrador eliminado correctamente",
				variant: "success",
			});
			setData(data.filter((admin) => admin.id !== id));
		}
		setIsLoading(false);
	};

	return (
		<div className="m-4 p-4 flex flex-col gap-4 bg-gray-50 border-2 border-gray-300 rounded-xl  shadow-gray-400">
			<BaseDataGrid
				columns={columns}
				data={data}
				isLoading={isLoading}
				onRowClick={handleRowClick}
				onEdit={handleRowClick}
				onDelete={handleDelete}
			>
				<DataGridHeader
					title="Administradores"
					itemName="Administrador"
					count={data.length}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					isLoading={isLoading}
					onNewClick={() => router.push("/admins/new")}
				/>
			</BaseDataGrid>
		</div>
	);
}
