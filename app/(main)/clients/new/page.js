"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/app/actions/clients";
import { fetchPods } from "@/app/actions/pods";
import { useToast } from "@/hooks/use-toast";
import Combobox from "@/components/ui/Combobox";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";

export default function newClient() {
	const { toast } = useToast();
	const [details, setDetails] = useState(null);
	const [podOptions, setPodOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchPodsOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchPods();
			setPodOptions(data);
			setIsLoading(false);
		};
		fetchPodsOptions();
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);

		const { data, error } = await createClient(details);

		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al crear el cliente",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Cliente creado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			router.push(`/clients/${data.id}`);
		}
	};

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const disableSave = !details?.name || !details?.email || isLoading;

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nuevo cliente</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear un nuevo cliente</p>
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

					{!details?.zapierException && (
					<div className="flex flex-col gap-2">
						<Input
							name="googleCalendarId"
							label="Google Calendar ID (personalizado)"
							placeholder={
								`Dejar vacío para usar el calendario por defecto del pod`
							}
							value={details?.googleCalendarId || ""}
							onChange={(e) => handleChange("googleCalendarId", e.target.value)}
						/>
					</div>
					)}
				</div>

				<div className="flex flex-col flex-1 justify-start gap-1 w-full">
					<div className="text-sm font-medium text-muted-foreground">
						Usar Zapier (omitir flujo interno)
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="zapierException"
							checked={details?.zapierException || false}
							onCheckedChange={(checked) => handleChange("zapierException", checked)}
						/>
						<p className="text-xs text-gray-500">
							Si está marcado, las reuniones de este cliente se enviarán directamente a Zapier
						</p>
					</div>
				</div>
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="submit" disabled={disableSave || isLoading} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear cliente"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
