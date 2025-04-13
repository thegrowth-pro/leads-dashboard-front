"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

export default function Login() {
	const [state, action, isPending] = useActionState(login, undefined);
	const [forgotModalOpen, setForgotModalOpen] = useState(false);

	return (
		<div className="bg-gray-900  text-gray-50 h-screen">
			<div className="flex items-center justify-center h-full w-full">
				<BackgroundGradient animate={true} className="rounded-xl min-w-80 max-w-80 p-4 bg-gray-900">
					<form action={action} className="flex flex-col ">
						<div className="flex flex-col justify-center items-center w-full gap-2 pt-4 pb-6">
							<Rocket size={60} className="bg-gray-900 p-3 rounded-xl shadow-sm shadow-gray-700" />
							<h1 className="font-bold text-2xl">TGP</h1>
							<p className="text-sm">Ingresa tus credenciales para continuar</p>
						</div>
						{isPending ? (
							<div className="flex flex-col justify-center items-center gap-1 text-center py-4">
								<Rocket className="size-6 animate-bounce " />
								<p> Cargando...</p>
							</div>
						) : (
							<div className="flex flex-col gap-4">
								<BackgroundGradient
									animate={false}
									className="flex justify-center items-center h-11 p-0"
								>
									<input
										name="email"
										placeholder="Email"
										className={cn(
											"rounded-md  px-3 py-1 text-base w-full h-full",
											"bg-transparent rounded-xl text-sm",
											"placeholder-gray-700 text-black"
										)}
									/>
								</BackgroundGradient>
								<div className="flex flex-col gap-2">
									<BackgroundGradient
										animate={false}
										className="flex justify-center items-center h-11 p-0"
									>
										<input
											name="password"
											placeholder="Contraseña"
											type="password"
											className={cn(
												"rounded-md  px-3 py-1 text-base w-full h-full",
												"bg-transparent rounded-xl text-sm",
												"placeholder-gray-700 text-black"
											)}
										/>
									</BackgroundGradient>

									<Dialog>
										<DialogTrigger>
											<p className="text-right text-xs text-gray-200 hover:underline hover:text-gray-50 cursor-pointer">
												Olvidaste tu contraseña?
											</p>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Olvidaste tu contraseña?</DialogTitle>
												<DialogDescription>
													Para restablecer tu contraseña, contacta al administrador. Él
													iniciará el proceso desde su cuenta y, a continuación, recibirás una
													nueva contraseña en tu correo electrónico.
												</DialogDescription>
											</DialogHeader>
										</DialogContent>
									</Dialog>
								</div>

								<BackgroundGradient
									animate={true}
									className="flex justify-center items-center h-11 p-0"
								>
									<Button
										type="submit"
										className="p-0 h-full w-full bg-gray-900 rounded-xl hover:bg-indigo-950  transition duration-50"
									>
										Iniciar Sesión
									</Button>
								</BackgroundGradient>
							</div>
						)}

						{state?.error && !isPending && (
							<p className="text-red-500 text-sm p-3 text-center">{state.error}</p>
						)}
					</form>
				</BackgroundGradient>
			</div>
		</div>
	);
}
