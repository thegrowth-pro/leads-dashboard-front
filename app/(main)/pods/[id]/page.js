"use client";

import { useEffect, useState, use } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPodDetails, updatePod, deletePod, addIntegrant, removeIntegrant } from "@/app/actions/pods";
import { fetchManagers, fetchSDRs } from "@/app/actions/users";
import { ListRestart, LoaderCircle, Plus, Trash2, X, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import Combobox from "@/components/ui/Combobox";
import Loading from "@/app/(main)/loading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function EditPod({ params }) {
	const unwrappedParams = use(params);
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const router = useRouter();
	const [details, setDetails] = useState(null);
	const [managerOptions, setManagerOptions] = useState([]);
	const [SRDOptions, setSDROptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [newIntegrant, setNewIntegrant] = useState(null);
	const [refreshDetails, setRefreshDetails] = useState(false);
	const [initialPod, setInitialPod] = useState(null);

	// Fetch all managers for the select
	useEffect(() => {
		const fetchManagersOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchManagers();
			setManagerOptions(data);
			setIsLoading(false);
		};
		fetchManagersOptions();
	}, []);

	// Fetch all SDRs for the select
	useEffect(() => {
		const fetchSDROptions = async () => {
			const { data } = await fetchSDRs();
			// Filter SDRs that are not in the pod
			const filteredData = data.filter(
				(sdr) => !initialPod?.assignedSDRs?.find((assignedSDR) => assignedSDR.id === sdr.id)
			);
			setSDROptions(filteredData);
		};
		fetchSDROptions();
	}, [initialPod]);

	// Fetch pod details
	useEffect(() => {
		const fetchDetails = async () => {
			if (unwrappedParams.id) {
				setIsLoading(true);
				const data = await fetchPodDetails(unwrappedParams.id);
				setDetails({
					id: data.id,
					name: data.name,
					manager: data.manager?.id,
					googleCalendarId: data.googleCalendarId,
					assignedSDRs: data.assignedSDRs,
				});
				setInitialPod(data);
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [unwrappedParams.id, refreshDetails]);

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		const { error } = await updatePod(details);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El nombre no está disponible. Intente con otro."
						: "Ocurrió un error al actualizar el pod",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Pod actualizado correctamente",
				variant: "success",
			});
		}
		setIsLoading(false);
	};

	const handleDelete = () => {
		openDialog({
			title: "Eliminar Pod",
			description: "¿Estás seguro de que deseas eliminar este pod?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await deletePod(unwrappedParams.id);
				if (error) {
					toast({
						title: "Error",
						description: "Ocurrió un error al eliminar el pod",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Pod eliminado correctamente",
						variant: "success",
					});
					router.push("/pods");
				}
				setIsLoading(false);
			}
		});
	};

	const handleAddIntegrant = async () => {
		if (!newIntegrant) return;

		setIsLoading(true);
		const { error } = await addIntegrant(details.id, newIntegrant);
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al agregar el integrante",
				variant: "destructive",
			});
			setIsLoading(false);
			setNewIntegrant(null);
		} else {
			toast({
				title: "Integrante agregado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setNewIntegrant(null);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleRemoveIntegrant = (userId) => {
		openDialog({
			title: "Remover Integrante",
			description: "¿Estás seguro de que deseas remover este integrante del pod?",
			confirmText: "Remover",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await removeIntegrant(userId);
				if (error) {
					toast({
						title: "Error",
						description: "Ocurrió un error al eliminar el integrante",
						variant: "destructive",
					});
					setIsLoading(false);
				} else {
					toast({
						title: "Integrante eliminado correctamente",
						variant: "success",
					});
					setIsLoading(false);
					setRefreshDetails(!refreshDetails);
				}
			}
		});
	};

	const disableSave = !details?.name || isLoading;

	if (isLoading || !details) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">{initialPod?.name}</h2>
				<p className="text-muted-foreground">Edita los campos del pod</p>
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
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Combobox
						label="Manager asignado"
						placeholder="Selecciona un Manager"
						items={managerOptions}
						value={details?.manager || ""}
						onChange={(value) => handleChange("manager", value)}
					/>
					<Input
						name="googleCalendarId"
						label="ID de Google Calendar"
						value={details?.googleCalendarId || ""}
						onChange={(e) => handleChange("googleCalendarId", e.target.value)}
					/>
				</div>

				<Accordion type="single" collapsible className="w-full bg-gray-200 rounded-md">
					<AccordionItem value="integrantes" className="border-none">
						<AccordionTrigger className="py-4 px-4">
							Integrantes ({details?.assignedSDRs?.length || 0})
						</AccordionTrigger>
						<AccordionContent className="px-4 pb-4">
							<div className="w-full flex flex-col gap-1 overflow-x-auto">
								{details?.assignedSDRs?.length ? (
									details?.assignedSDRs?.map((sdr) => (
										<div
											key={sdr.id}
											className="flex items-center justify-between gap-4 text-sm hover:underline px-1"
										>
											<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
												<p>{sdr.name}</p>
												<p className="text-gray-500 text-xs sm:text-sm">{sdr.email}</p>
											</div>
											<Button
												variant="outline"
												type="button"
												size="sm"
												className="border-none text-red-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300"
												onClick={() => handleRemoveIntegrant(sdr.id)}
											>
												<X className="size-3" />
											</Button>
										</div>
									))
								) : (
									<p className="text-sm px-1 text-gray-500 text-center py-2">
										Todavía no hay integrantes en este pod
									</p>
								)}

								<div className="flex gap-2 py-2 px-1 items-end">
									<div className="flex-1">
										<Combobox
											label="Agregar integrante"
											placeholder="Selecciona un SDR"
											items={SRDOptions}
											value={newIntegrant || ""}
											onChange={setNewIntegrant}
										/>
									</div>
									<Button type="button" onClick={handleAddIntegrant}>
										<Plus className="" />
									</Button>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<div className="flex justify-between gap-4 w-full px-4 py-4 border-t border-gray-300 bg-background mt-auto">
				<div className="flex gap-4">
					<Button
						className="bg-red-100 border-none text-red-600 hover:bg-red-200 hover:text-red-600"
						variant="outline"
						onClick={handleDelete}
						type="button"
						disabled={isLoading}
					>
						<Trash2 className="text-red-600" />
						<p className="hidden sm:flex">Eliminar</p>
					</Button>
				</div>
				<Button type="submit" onClick={handleSave} disabled={disableSave}>
					<Save className="size-4" />
					<p className="hidden sm:flex">Guardar</p>
				</Button>
			</div>

			{/* Modal de confirmación de eliminación */}
			<ConfirmDialog
				isOpen={isOpen}
				onClose={closeDialog}
				onConfirm={handleConfirm}
				title={dialogConfig.title}
				description={dialogConfig.description}
				confirmText={dialogConfig.confirmText}
			/>

			{isLoading && <Loading />}
		</div>
	);
}
