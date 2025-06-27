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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/app/actions/accounts";
import Combobox from "@/components/ui/Combobox";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";
import FormBuilder from "@/components/forms/FormBuilder";
import { fetchFormsByClient, createForm, updateForm, activateForm, deleteForm } from "@/app/actions/forms";

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
	const [clientForms, setClientForms] = useState([]);
	const [currentForm, setCurrentForm] = useState(null);
	const [isEditingForm, setIsEditingForm] = useState(false);
	const [activeTab, setActiveTab] = useState("sellers");

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

	// Fetch client forms
	useEffect(() => {
		const fetchForms = async () => {
			if (unwrappedParams.id) {
				const { data, error } = await fetchFormsByClient(unwrappedParams.id);
				if (!error) {
					setClientForms(data);
					const activeForm = data.find(form => form.active);
					if (activeForm && !currentForm) {
						setCurrentForm(activeForm);
					}
				}
			}
		};
		fetchForms();
	}, [unwrappedParams.id, refreshDetails]);

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

	const handleNewForm = () => {
		setCurrentForm({
			name: `Formulario - ${details.name}`,
			description: "",
			clientId: details.id,
			active: true,
			fields: []
		});
		setIsEditingForm(true);
		setActiveTab("forms"); // Asegurar que estemos en el tab de formularios
	};

	const handleEditForm = (form) => {
		setCurrentForm(form);
		setIsEditingForm(true);
		setActiveTab("forms"); // Asegurar que estemos en el tab de formularios
	};

	const handleFormChange = (updatedForm) => {
		setCurrentForm(updatedForm);
	};

	const handleSaveForm = async () => {
		if (!currentForm || !currentForm.name.trim()) {
			toast({
				title: "Error",
				description: "El nombre del formulario es obligatorio",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			const { data, error } = currentForm.id 
				? await updateForm(currentForm.id, currentForm)
				: await createForm(currentForm);

			if (error) {
				toast({
					title: "Error",
					description: "No se pudo guardar el formulario",
					variant: "destructive",
				});
			} else {
				toast({
					title: "Formulario guardado",
					description: "El formulario se guardó correctamente",
					variant: "success",
				});
				setIsEditingForm(false);
				setCurrentForm(null); // Resetear el formulario actual
				setRefreshDetails(!refreshDetails);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error inesperado",
				variant: "destructive",
			});
		}
		setIsLoading(false);
	};

	const handleActivateForm = async (formId) => {
		setIsLoading(true);
		const { error } = await activateForm(formId);
		if (error) {
			toast({
				title: "Error",
				description: "No se pudo activar el formulario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Formulario activado",
				description: "El formulario ahora está activo para nuevas reuniones",
				variant: "success",
			});
			setRefreshDetails(!refreshDetails);
		}
		setIsLoading(false);
	};

	const handleDeleteForm = async (formId) => {
		setIsLoading(true);
		const { error } = await deleteForm(formId);
		if (error) {
			toast({
				title: "Error",
				description: error.statusCode === 400 
					? "No se puede eliminar un formulario con reuniones asociadas"
					: "No se pudo eliminar el formulario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Formulario eliminado",
				description: "El formulario se eliminó correctamente",
				variant: "success",
			});
			setRefreshDetails(!refreshDetails);
		}
		setIsLoading(false);
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

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full bg-gray-100 rounded-md">
					<TabsList className="flex justify-between w-full gap-2 bg-gray-200 items-center p-2">
						<TabsTrigger className="bg-gray-200 hover:bg-gray-300 hover:text-gray-600" value="sellers">
							Ejecutivos ({details?.sellers?.length || 0})
						</TabsTrigger>
						<TabsTrigger className="bg-gray-200 hover:bg-gray-300 hover:text-gray-600" value="inboxes">
							Bandejas ({details?.inboxes?.length || 0})
						</TabsTrigger>
						<TabsTrigger className="bg-gray-200 hover:bg-gray-300 hover:text-gray-600" value="forms">
							Formularios
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

					<TabsContent value="forms" className="w-full p-2 flex flex-col gap-4">
						{isEditingForm ? (
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<h4 className="text-lg font-semibold">
										{currentForm?.id ? "Editar formulario" : "Nuevo formulario"}
									</h4>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setIsEditingForm(false);
												setCurrentForm(null);
											}}
										>
											Cancelar
										</Button>
										<Button
											type="button"
											onClick={handleSaveForm}
											disabled={isLoading}
										>
											<Save className="size-4 mr-2" />
											Guardar
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Nombre del formulario"
										value={currentForm?.name || ""}
										onChange={(e) => handleFormChange({
											...currentForm,
											name: e.target.value
										})}
										required
									/>
									<Input
										label="Descripción"
										value={currentForm?.description || ""}
										onChange={(e) => handleFormChange({
											...currentForm,
											description: e.target.value
										})}
									/>
								</div>

								<FormBuilder
									form={currentForm}
									onFormChange={handleFormChange}
									disabled={isLoading}
								/>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<h4 className="text-lg font-semibold">Formularios del cliente</h4>
									<Button
										type="button"
										onClick={handleNewForm}
										disabled={isLoading}
									>
										<Plus className="size-4 mr-2" />
										Nuevo formulario
									</Button>
								</div>

								{clientForms.length > 0 ? (
									<div className="space-y-3">
										{clientForms.map((form) => (
											<div
												key={form.id}
												className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50"
											>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<h5 className="font-medium">{form.name}</h5>
														{form.active && (
															<Badge variant="default" className="bg-green-100 text-green-800">
																Activo
															</Badge>
														)}
													</div>
													{form.description && (
														<p className="text-sm text-gray-500 mt-1">{form.description}</p>
													)}
													<p className="text-xs text-gray-400 mt-1">
														{form.fields?.length || 0} campos configurados
													</p>
												</div>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEditForm(form)}
														disabled={isLoading}
													>
														Editar
													</Button>
													{!form.active && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleActivateForm(form.id)}
															disabled={isLoading}
															className="text-green-600 hover:text-green-700"
														>
															Activar
														</Button>
													)}
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteForm(form.id)}
														disabled={isLoading}
														className="text-red-600 hover:text-red-700"
													>
														<Trash2 className="size-3" />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-gray-500 mb-4">No hay formularios creados para este cliente</p>
										<Button
											type="button"
											onClick={handleNewForm}
											disabled={isLoading}
										>
											<Plus className="size-4 mr-2" />
											Crear primer formulario
										</Button>
									</div>
								)}
							</div>
						)}
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
