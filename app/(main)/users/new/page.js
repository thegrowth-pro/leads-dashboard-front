"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { createUser } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";

export default function NewUser() {
	const { toast } = useToast();
	const router = useRouter();
	const [details, setDetails] = useState({
		name: "",
		email: "",
		role: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		const { data, error } = await createUser(details);

		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al crear el usuario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Usuario creado correctamente",
				variant: "success",
			});
			router.push(`/users/${data.user.userId}`);
		}
		setIsLoading(false);
	};

	const disableSave = !details?.name || !details?.email || !details?.role || isLoading;

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nuevo usuario</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear un nuevo usuario</p>
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
					<div className="flex flex-col">
						<label className="text-sm font-medium text-muted-foreground px-1">Rol</label>
						<Select value={details?.role || ""} onValueChange={(value) => handleChange("role", value)}>
							<SelectTrigger>
								<SelectValue placeholder="Selecciona un Rol" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Roles</SelectLabel>
									<SelectItem value="MANAGER">Manager</SelectItem>
									<SelectItem value="SDR">SDR</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="submit" disabled={disableSave || isLoading} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear usuario"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
