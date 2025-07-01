"use client";

import { useEffect, useState, use } from "react";
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
import { fetchUserDetails, updateUser, deleteUser } from "@/app/actions/users";
import { fetchPods } from "@/app/actions/pods";
import { ListRestart, LoaderCircle, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { resetPassword } from "@/app/actions/accounts";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";

export default function EditUser({ params }) {
	const unwrappedParams = use(params);
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const router = useRouter();
	const [details, setDetails] = useState(null);
	const [podOptions, setPodOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [initialUser, setInitialUser] = useState(null);
	const [isResettingPassword, setIsResettingPassword] = useState(false);

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
				const { data, error } = await fetchUserDetails(unwrappedParams.id);
				if (error) {
					router.push("/not-found");
				}
				setDetails({
					id: data.id,
					pod: data.pod?.id,
					role: data.role,
					name: data.name,
					email: data.email,
				});
				setInitialUser(data);
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [unwrappedParams.id]);

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		setIsLoading(true);
		// Comprueba si se cambió el rol
		let dets = { ...details };
		if (details.role !== initialUser.role) {
			// Si se cambió el rol, se saca del pod
			if (initialUser.pod) {
				dets = { ...details, pod: null };
			}
		}

		const { error } = await updateUser(dets);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al actualizar el usuario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Usuario actualizado correctamente",
				variant: "success",
			});
		}
		setIsLoading(false);
	};

	const handleDelete = () => {
		openDialog({
			title: "Eliminar Usuario",
			description: "¿Estás seguro de que deseas eliminar este usuario?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				setIsLoading(true);
				const { error } = await deleteUser(unwrappedParams.id);
				if (error) {
					toast({
						title: "Error",
						description: "Ocurrió un error al eliminar el usuario",
						variant: "destructive",
					});
				} else {
					toast({
						title: "Usuario eliminado correctamente",
						variant: "success",
					});
					router.push("/users");
				}
				setIsLoading(false);
			}
		});
	};

	const handleResetPassword = async () => {
		setIsResettingPassword(true);
		const { error } = await resetPassword({ userId: unwrappedParams.id, userType: "user" });
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al resetear la contraseña",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Contraseña reseteada correctamente",
				variant: "success",
			});
		}
		setIsResettingPassword(false);
	};

	const disableSave =
		!details?.name ||
		!details?.email ||
		!details?.role ||
		(details?.role === "SDR" && !details?.pod && initialUser?.pod) ||
		isLoading;

	if (isLoading || !details || !initialUser) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<div className="flex items-center gap-4">
					<div className="flex items-center justify-center gap-2 rounded-full w-10 h-10 bg-primary text-white">
						{initialUser.name
							? initialUser.name
									.trim()
									.split(" ")
									.map((n) => n[0].toUpperCase())
									.join("")
							: initialUser.email[0].toUpperCase()}
					</div>
					<div>
						<h2 className="text-xl font-semibold">{initialUser.name}</h2>
						<p className="text-muted-foreground">{initialUser.email}</p>
					</div>
				</div>
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
						{initialUser?.pod && (
							<p className="text-red-500 text-[11px] p-1">
								* Si cambias de rol a este usuario se saldrá del pod {initialUser?.pod?.name}{" "}
								automáticamente
							</p>
						)}
					</div>
					{((details?.role === initialUser?.role && initialUser?.pod) || !initialUser?.pod) && (
						<div className="flex flex-col">
							<label className="text-sm font-medium text-muted-foreground px-1">Pod</label>
							<Select value={details?.pod || ""} onValueChange={(value) => handleChange("pod", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona un Pod" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Pods</SelectLabel>
										{podOptions.map((pod) => (
											<SelectItem key={pod.id} value={pod.id}>
												{pod.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
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
					<Button
						className="bg-indigo-100 border-none text-indigo-600 hover:bg-indigo-200 hover:text-indigo-600"
						variant="outline"
						onClick={handleResetPassword}
						type="button"
						disabled={isResettingPassword || isLoading}
					>
						{isResettingPassword ? (
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
