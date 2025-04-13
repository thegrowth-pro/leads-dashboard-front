"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createCountry } from "@/app/actions/countries";
import { Input } from "@/components/ui/input";
import Loading from "@/app/(main)/loading";

export default function NewCountryPage() {
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [countryName, setCountryName] = useState("");
	const [countryCode, setCountryCode] = useState("");

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		if (!countryName || !countryCode) {
			toast({
				title: "Error",
				description: "Por favor completa todos los campos",
				variant: "destructive",
			});
			setIsLoading(false);
			return;
		}

		const { error } = await createCountry({ name: countryName, code: countryCode });

		if (error) {
			toast({
				title: "Error",
				description: "No se pudo crear el país",
				variant: "destructive",
			});
			return;
		}
		toast({
			title: "País creado correctamente",
			variant: "success",
		});
		setIsLoading(false);
		router.push("/settings");
	};

	const disableSave = !countryName || !countryCode || isLoading;

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nuevo país</h2>
				<p className="text-muted-foreground">
					Ingresa los datos del país para agregarlo a la lista de países disponibles
				</p>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-muted-foreground">Nombre del país</label>
					<Input
						type="text"
						value={countryName}
						onChange={(e) => setCountryName(e.target.value)}
						placeholder="Ingresa el nombre del país"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-muted-foreground">Código del país</label>
					<Input
						type="text"
						value={countryCode}
						onChange={(e) => setCountryCode(e.target.value)}
						placeholder="Ingresa el código del país"
					/>
				</div>
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="button" variant="outline" onClick={() => router.push("/settings")}>
					Cancelar
				</Button>
				<Button type="submit" disabled={disableSave} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear país"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
