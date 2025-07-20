"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPod } from "@/app/actions/pods";
import { fetchManagers } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Combobox from "@/components/ui/Combobox";
import Loading from "@/app/(main)/loading";

export default function NewPod() {
	const { toast } = useToast();
	const router = useRouter();
	const [details, setDetails] = useState({
		name: "",
		manager: "",
		googleCalendarId: "",
		slackChannelId: "",
	});
	const [managerOptions, setManagerOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

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

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		const { error } = await createPod(details);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El nombre no está disponible. Intente con otro."
						: "Ocurrió un error al crear el pod",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Pod creado correctamente",
				variant: "success",
			});
			router.push("/pods");
		}
		setIsLoading(false);
	};

	const disableSave = !details?.name || isLoading;

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nuevo pod</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear un nuevo pod</p>
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
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						name="slackChannelId"
						label="ID del Canal de Slack"
						placeholder="Ej: C1234567890"
						value={details?.slackChannelId || ""}
						onChange={(e) => handleChange("slackChannelId", e.target.value)}
					/>
				</div>
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="submit" disabled={disableSave || isLoading} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear pod"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
