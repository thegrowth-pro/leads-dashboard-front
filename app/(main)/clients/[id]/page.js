"use client";

import { useEffect, useState, use } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	fetchClientDetails,
	updateClient,
	deleteClient,
	addClientSeller,
	deleteClientSeller,
	addClientInbox,
	deleteClientInbox,
} from "@/app/actions/clients";
import { fetchPods } from "@/app/actions/pods";
import { ListRestart, LoaderCircle, Plus, Trash2, X, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/app/actions/accounts";
import Combobox from "@/components/ui/Combobox";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";

export default function EditClient({ params }) {
	const unwrappedParams = use(params);
	const { toast } = useToast();
	const router = useRouter();
	const [details, setDetails] = useState(null);
	const [podOptions, setPodOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [newSeller, setNewSeller] = useState(null);
	const [newInbox, setNewInbox] = useState(null);
	const [refreshDetails, setRefreshDetails] = useState(false);
	const [initialClient, setInitialClient] = useState(null);
	const [isResettingClientPassword, setIsResettingClientPassword] = useState(false);
	const [isResettingSellerPassword, setIsResettingSellerPassword] = useState(false);

	// Fetch all pods for the select
	useEffect(() => {
		const fetchPodsOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchPods();
			setPodOptions(data);
			setIsLoading(false);
		};
		fetchPodsOptions();
	}, []);

	// Fetch item details al cargar el componente o cuando cambia el ID
	useEffect(() => {
		const fetchDetails = async () => {
			if (unwrappedParams.id) {
				setIsLoading(true);
				const { data, error } = await fetchClientDetails(unwrappedParams.id);
				if (error) {
					router.push("/not-found");
				}
				setDetails({
					id: data.id,
					name: data.name,
					email: data.email,
					assignedPod: data?.assignedPod?.id,
					sellers: data?.sellers,
					inboxes: data?.inboxes,
				});
				setInitialClient(data);
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [fetchClientDetails, refreshDetails, unwrappedParams.id]);

	// Manejo del envío del formulario para guardar
	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);
		const { data, error } = await updateClient(details);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al actualizar el cliente",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Cliente actualizado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			router.push(`/clients/${unwrappedParams.id}`);
		}
	};

	// Manejo de eliminación
	const handleDelete = async () => {
		if (unwrappedParams.id) {
			setIsLoading(true);
			const { error } = await deleteClient(unwrappedParams.id);
			if (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al eliminar el cliente",
					variant: "destructive",
				});
				setIsLoading(false);
			} else {
				toast({
					title: "Cliente eliminado correctamente",
					variant: "success",
				});
				setIsLoading(false);
				router.push("/clients");
			}
		}
	};

	// Manejo de cambios en el formulario
	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleAddSeller = async () => {
		if (!newSeller) return;
		setIsLoading(true);

		const { data, error } = await addClientSeller(details.id, newSeller);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al agregar el vendedor",
				variant: "destructive",
			});
			setIsLoading(false);
			setNewSeller(null);
		} else {
			toast({
				title: "Vendedor agregado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setNewSeller(null);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleDeleteSeller = async (sellerId) => {
		setIsLoading(true);
		const { error } = await deleteClientSeller(sellerId);

		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al eliminar el vendedor",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Vendedor eliminado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleAddInbox = async () => {
		if (!newInbox) return;
		setIsLoading(true);
		const { data, error } = await addClientInbox(details.id, newInbox);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al agregar la bandeja",
				variant: "destructive",
			});
			setIsLoading(false);
			setNewInbox(null);
		} else {
			toast({
				title: "Bandeja agregada correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setNewInbox(null);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleDeleteInbox = async (inboxId) => {
		setIsLoading(true);
		const { error } = await deleteClientInbox(inboxId);

		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al eliminar la bandeja",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Bandeja eliminada correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleResetClientPassword = async () => {
		setIsResettingClientPassword(true);
		const { error } = await resetPassword({ userId: unwrappedParams.id, userType: "client" });
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al resetear la contraseña",
				variant: "destructive",
			});
			setIsResettingClientPassword(false);
		} else {
			toast({
				title: "Contraseña reseteada correctamente",
				variant: "success",
			});
			setIsResettingClientPassword(false);
		}
	};

	const handleResetSellerPassword = async (sellerId) => {
		setIsResettingSellerPassword(sellerId);
		const { error } = await resetPassword({ userId: sellerId, userType: "seller" });
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al resetear la contraseña",
				variant: "destructive",
			});
			setIsResettingSellerPassword(false);
		} else {
			toast({
				title: "Contraseña reseteada correctamente",
				variant: "success",
			});
			setIsResettingSellerPassword(false);
		}
	};

	const disableSave = !details?.name || !details?.email || isLoading;
	const disableAddSeller = !newSeller?.name || !newSeller?.email || isLoading;
	const disableAddInbox = !newInbox?.email || isLoading;

	if (isLoading || !details || !initialClient) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">{initialClient?.name}</h2>
				<p className="text-muted-foreground">{initialClient?.email}</p>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex flex-col md:flex-row gap-4">
					<Input
						name="name"
						label="Nombre"
						placeholder="Ingrese el nombre"
						value={details?.name || ""}
						onChange={(e) => handleChange("name", e.target.value)}
						required
					/>
					<Input
						name="email"
						label="Email"
						placeholder="Ingrese el email"
						type="email"
						value={details?.email || ""}
						onChange={(e) => handleChange("email", e.target.value)}
						required
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Combobox
						label="Pod asignado"
						placeholder="Selecciona un Pod"
						items={podOptions}
						value={details?.assignedPod || ""}
						onChange={(value) => handleChange("assignedPod", value)}
					/>
				</div>

				<Tabs defaultValue="sellers" className="w-full bg-gray-100 rounded-md">
					<TabsList className="flex justify-between w-full gap-2 bg-gray-200 items-center p-2">
						<TabsTrigger className="bg-gray-200 hover:bg-gray-300 hover:text-gray-600" value="sellers">
							Ejecutivos ({details?.sellers?.length || 0})
						</TabsTrigger>
						<TabsTrigger className="bg-gray-200 hover:bg-gray-300 hover:text-gray-600" value="inboxes">
							Bandejas ({details?.inboxes?.length || 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="sellers" className="w-full p-2 flex flex-col gap-1 overflow-x-auto">
						{details?.sellers?.length ? (
							details?.sellers?.map((seller) => (
								<div
									key={seller.id}
									className="flex items-center justify-between gap-4 text-sm hover:underline px-1"
								>
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
										<p>{seller.name}</p>
										<p className="text-gray-500 text-xs sm:text-sm">{seller.email}</p>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											type="button"
											size="sm"
											className="border-none text-indigo-600 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300"
											onClick={() => handleResetSellerPassword(seller.id)}
										>
											{isResettingSellerPassword === seller.id ? (
												<LoaderCircle className="animate-spin size-3" />
											) : (
												<ListRestart className="size-3" />
											)}
										</Button>
										<Button
											variant="outline"
											type="button"
											size="sm"
											className="border-none text-red-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300"
											onClick={() => handleDeleteSeller(seller.id)}
										>
											<X className="size-3" />
										</Button>
									</div>
								</div>
							))
						) : (
							<p className="text-sm px-1 text-gray-500 text-center py-2">
								Todavía no hay ejecutivos o vendedores asignados
							</p>
						)}
						<div className="flex gap-2 py-2 px-1 items-end">
							<Input
								size="sm"
								name="seller_name"
								label="Vendedor"
								placeholder="Nombre"
								value={newSeller?.name || ""}
								onChange={(e) =>
									setNewSeller({
										...newSeller,
										name: e.target.value,
									})
								}
							/>
							<Input
								name="seller_email"
								label="Email"
								size="sm"
								placeholder="Email"
								value={newSeller?.email || ""}
								onChange={(e) =>
									setNewSeller({
										...newSeller,
										email: e.target.value,
									})
								}
							/>
							<Button
								type="button"
								size="sm"
								onClick={handleAddSeller}
								className="h-7"
								disabled={disableAddSeller}
							>
								<Plus className="" />
							</Button>
						</div>
					</TabsContent>
					<TabsContent value="inboxes" className="w-full p-2 flex flex-col gap-1">
						{details?.inboxes?.length ? (
							details?.inboxes?.map((inbox) => (
								<div
									key={inbox.id}
									className="flex items-center justify-between gap-4 text-sm hover:underline px-1"
								>
									<div className="flex items-center gap-2">
										<p>{inbox.email}</p>
										<p className="text-gray-500">{inbox.email}</p>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											type="button"
											size="sm"
											className="border-none text-red-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300"
											onClick={() => handleDeleteInbox(inbox.id)}
										>
											<X className="size-3" />
										</Button>
									</div>
								</div>
							))
						) : (
							<p className="text-sm px-1 text-gray-500 text-center py-2">
								Todavía no hay bandejas creadas para este cliente
							</p>
						)}
						<div className="flex gap-2 py-2 px-1 items-end">
							<Input
								name="inbox_email"
								label="Email"
								size="sm"
								placeholder="Email"
								value={newInbox?.email || ""}
								onChange={(e) =>
									setNewInbox({
										...newInbox,
										email: e.target.value,
									})
								}
							/>
							<Button
								type="button"
								size="sm"
								onClick={handleAddInbox}
								className="h-7"
								disabled={disableAddInbox}
							>
								<Plus className="" />
							</Button>
						</div>
					</TabsContent>
				</Tabs>
			</div>

			<div className="flex justify-between gap-4 w-full px-4 py-4 border-t border-gray-300 bg-background mt-auto">
				<div className="flex gap-4">
					<Button
						className="bg-red-100 border-none text-red-600 hover:bg-red-200 hover:text-red-600"
						variant="outline"
						onClick={handleDelete}
						type="button"
						disabled={isLoading || !unwrappedParams.id || !details || !details.id}
					>
						<Trash2 className="text-red-600" />
						<p className="hidden sm:flex">Eliminar</p>
					</Button>
					<Button
						className="bg-indigo-100 border-none text-indigo-600 hover:bg-indigo-200 hover:text-indigo-600"
						variant="outline"
						onClick={handleResetClientPassword}
						type="button"
						disabled={
							isResettingClientPassword || isLoading || !unwrappedParams.id || !details || !details.id
						}
					>
						{isResettingClientPassword ? (
							<LoaderCircle className="animate-spin size-3" />
						) : (
							<ListRestart className="size-3" />
						)}
						<p className="hidden sm:flex">Restablecer contraseña</p>
					</Button>
				</div>
				<Button type="submit" onClick={handleSave} disabled={disableSave}>
					<Save className="size-4" />
					<p className="hidden sm:flex">Guardar</p>
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
