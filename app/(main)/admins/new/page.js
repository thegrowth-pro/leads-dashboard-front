"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAdmin } from "@/app/actions/admins";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";

export default function NewAdmin() {
	const { toast } = useToast();
	const [details, setDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Initialize empty form
		setDetails({ email: "" });
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);

		const { data, error } = await createAdmin(details);

		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al crear el administrador",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Administrador creado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			router.push(`/admins/${data.id}`);
		}
	};

	// Handle form changes
	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const disableSave = !details?.email || isLoading;

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nuevo administrador</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear un nuevo administrador</p>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex flex-col md:flex-row gap-4">
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
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="submit" disabled={disableSave || isLoading} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear administrador"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
