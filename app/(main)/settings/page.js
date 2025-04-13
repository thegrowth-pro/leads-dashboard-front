"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCountries, deleteCountries } from "@/app/actions/countries";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import BaseDataGrid from "@/components/ui/BaseDataGrid";
import DataGridHeader from "@/components/ui/DataGridHeader";

const countriesColumns = [
	{ header: "Nombre", accessor: "name" },
	{ header: "Código", accessor: "code" },
];

function page() {
	const { toast } = useToast();
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const { data, error } = await fetchCountries(searchTerm);
			if (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los países",
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
		router.push(`/settings/countries/${id}`);
	};

	const handleDelete = async (id) => {
		setIsLoading(true);
		const { error } = await deleteCountries(id);
		if (error) {
			toast({
				title: "Error",
				description: "No se pudo eliminar el país",
				variant: "destructive",
			});
		} else {
			toast({
				title: "País eliminado correctamente",
				variant: "success",
			});
			setData(data.filter((country) => country.id !== id));
		}
		setIsLoading(false);
	};

	return (
		<div className="m-4 p-4 flex bg-gray-50 border-2 border-gray-300 rounded-xl  shadow-gray-400">
			<Tabs defaultValue="countries" className="w-full">
				<TabsList className="flex justify-between w-full">
					<TabsTrigger value="countries">Países</TabsTrigger>
					<TabsTrigger value="other">Otros</TabsTrigger>
				</TabsList>
				<TabsContent value="countries" className="w-full p-1">
					<BaseDataGrid
						columns={countriesColumns}
						data={data}
						isLoading={isLoading}
						onEdit={handleRowClick}
						onDelete={handleDelete}
					>
						<DataGridHeader
							title="Países"
							itemName="País"
							count={data.length}
							searchTerm={searchTerm}
							onSearchChange={setSearchTerm}
							isLoading={isLoading}
							onNewClick={() => router.push("/settings/countries/new")}
						/>
					</BaseDataGrid>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default page;
