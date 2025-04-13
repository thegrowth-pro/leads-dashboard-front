"use client";
import { useState, useEffect } from "react";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";
import { fetchUsers, deleteUser } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";
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
export default function UsersPage() {
	const { toast } = useToast();
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const { selectedFilters, updateFilter, _hasHydrated } = useFilterStore();

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
			header: "Pod",
			accessor: "pod.name",
			type: "text",
		},
		{
			header: "Rol",
			accessor: "role",
			type: "chip",
			options: { MANAGER: "green", SDR: "blue" },
		},
	];

	const filters = [
		{
			label: "Rol",
			value: "role",
			oneOnly: true,
			options: [
				{ value: "MANAGER", label: "Manager" },
				{ value: "SDR", label: "SDR" },
			],
		},
	];

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, error } = await fetchUsers(searchTerm, selectedFilters);
			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los usuarios",
					variant: "destructive",
				});
			} else {
				setData(data);
			}
			setIsLoading(false);
		}
		selectedFilters && debouncedSearchTerm !== null && _hasHydrated && fetchData();
	}, [debouncedSearchTerm, selectedFilters, _hasHydrated]);

	const handleRowClick = (id) => {
		router.push(`/users/${id}`);
	};

	const handleDelete = async (id) => {
		setIsLoading(true);
		const { error } = await deleteUser(id);
		if (error) {
			toast({
				title: "Error",
				description: "No se pudo eliminar el usuario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Usuario eliminado correctamente",
				variant: "success",
			});
			setData(data.filter((user) => user.id !== id));
		}
		setIsLoading(false);
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
					title="Usuarios"
					itemName="Usuario"
					count={data.length}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					isLoading={isLoading}
					onNewClick={() => router.push("/users/new")}
					filters={filters}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="bg-gray-100 ">
								<ListFilter className="h-4 w-4" />
								<p className="hidden md:flex">Filtrar</p>
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
													updateFilter(filter.value, option.value, isChecked, filter.oneOnly)
												}
											/>
											<label className="text-xs font-medium leading-none">{option.label}</label>
										</div>
									))}
								</div>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</DataGridHeader>
			</BaseDataGrid>
		</div>
	);
}
