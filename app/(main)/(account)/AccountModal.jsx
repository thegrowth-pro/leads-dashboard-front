"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useAppStore from "@/app/store/app";
import { changePassword } from "@/app/actions/accounts";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";

const userTypes = {
	ADMIN: "Administrador",
	EXTERNAL: "Cliente",
	INTERNAL: "Empleado",
};

function AccountModal({ session }) {
	const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);
	const { toast } = useToast();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const disableSave =
		!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading;

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			// Save password
			const changePasswordResponse = await changePassword({ newPassword, currentPassword });
			if (changePasswordResponse.error) {
				toast({
					title: "Error",
					description:
						"Hubo un error al cambiar la contraseña. Por favor, verifique que la contraseña actual sea correcta.",
					variant: "destructive",
				});
				setIsLoading(false);
				return;
			}

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			toast({
				title: "Contraseña actualizada exitosamente",
				variant: "success",
			});

			useAppStore.setState({ isAccountModalOpen: false });
		} catch (error) {
			console.error(error);
		}
		setIsLoading(false);
	};

	return (
		<Dialog open={isAccountModalOpen} onOpenChange={() => useAppStore.setState({ isAccountModalOpen: false })}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mi Cuenta</DialogTitle>
					<DialogDescription className="hidden"></DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center justify-center gap-2 rounded-full w-12 h-12 bg-primary text-white">
							{session?.name
								? session?.name
										.split(" ")
										.map((n) => n[0].toUpperCase())
										.join("")
								: session?.email[0].toUpperCase()}
						</div>
						<div className="flex flex-col gap-0">
							<div className="flex gap-1">
								{session?.name && <p className="font-semibold text">{session?.name}</p>}
								<p className="text-primary">{session?.email}</p>
							</div>
							<p className="text-foreground">
								{session?.isAdmin
									? "Administrador"
									: session?.accountType === "EXTERNAL"
									? `${session?.company ? `Vendedor - ${session.company}` : session?.name}`
									: session?.accountType === "INTERNAL"
									? `${session?.pod ? `${session.role} - ${session.pod}` : session?.role}`
									: null}
							</p>
						</div>
					</div>
					<Separator />
					<div className="flex flex-col gap-1">
						<p className="font-semibold ">Cambiar contraseña</p>
						<p className="text-gray-500 text-sm">Puedes cambiar tu contraseña en cualquier momento.</p>

						<form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
							<div className="flex flex-col gap-3">
								<Input
									name="currentPassword"
									label="Contraseña actual"
									placeholder="Ingrese la contraseña actual"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									required
								/>
								<div className="flex gap-2">
									<Input
										name="newPassword"
										label="Nueva contraseña"
										placeholder="Ingrese la nueva contraseña"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
									/>
									<Input
										name="confirmPassword"
										label="Confirmar contraseña"
										placeholder="Confirme la nueva contraseña"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
								</div>
							</div>
							<Button type="submit" disabled={disableSave}>
								{isLoading ? (
									<div className="flex items-center gap-2 justify-center">
										<LoaderCircle className="animate-spin" />
										Cargando...
									</div>
								) : (
									"Cambiar contraseña"
								)}
							</Button>
						</form>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AccountModal;
