"use client";

import { useEffect, useState, use } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAdminDetails, updateAdmin, deleteAdmin } from "@/app/actions/admins";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import { ListRestart, Trash2, Save } from "lucide-react";
import Loading from "@/app/(main)/loading";
import { resetPassword } from "@/app/actions/accounts";

export default function EditAdmin({ params }) {
	const unwrappedParams = use(params);
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const router = useRouter();
	const [details, setDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [initialAdmin, setInitialAdmin] = useState(null);

	// Fetch admin details when component loads or ID changes
	useEffect(() => {
		const fetchDetails = async () => {
			if (unwrappedParams.id) {
				setIsLoading(true);
				const data = await fetchAdminDetails(unwrappedParams.id);
				if (data.error) {
					router.push("/not-found");
				}
				setDetails({
					id: data.id,
					email: data.email,
				});
				setInitialAdmin(data);
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [unwrappedParams.id]);

	// Handle form submission
	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);
		const { data, error } = await updateAdmin(details);
		if (error) {
			toast({
				title: "Error",
				description:
					error.statusCode === 409
						? "El email no está disponible. Intente con otro."
						: "Ocurrió un error al actualizar el administrador",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Administrador actualizado correctamente",
				variant: "success",
			});
			setIsLoading(false);
			router.push(`/admins/${unwrappedParams.id}`);
		}
	};

	// Handle deletion
	const handleDelete = () => {
		openDialog({
			title: "Eliminar Administrador",
			description: "¿Estás seguro de que deseas eliminar este administrador?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				if (unwrappedParams.id) {
					setIsLoading(true);
					const { error } = await deleteAdmin(unwrappedParams.id);
					if (error) {
						toast({
							title: "Error",
							description: "Ocurrió un error al eliminar el administrador",
							variant: "destructive",
						});
						setIsLoading(false);
					} else {
						toast({
							title: "Administrador eliminado correctamente",
							variant: "success",
						});
						setIsLoading(false);
						router.push("/admins");
					}
				}
			}
		});
	};

	// Handle form changes
	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleResetPassword = async () => {
		if (unwrappedParams.id) {
			setIsResettingPassword(true);
			const { error } = await resetPassword({ userId: unwrappedParams.id, userType: "admin" });
			if (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al resetear la contraseña",
					variant: "destructive",
				});
				setIsResettingPassword(false);
			} else {
				toast({
					title: "Contraseña reseteada correctamente",
					variant: "success",
				});
				setIsResettingPassword(false);
			}
		}
	};

	const disableSave = !details?.email || isLoading;

	if (isLoading || !details || !initialAdmin) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">{initialAdmin?.email}</h2>
				<p className="text-muted-foreground">Administrador</p>
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
						onClick={handleResetPassword}
						type="button"
						disabled={isResettingPassword || isLoading || !unwrappedParams.id || !details || !details.id}
					>
						{isResettingPassword ? (
							<ListRestart className="animate-spin" />
						) : (
							<ListRestart className="text-indigo-600" />
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
