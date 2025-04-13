"use client";

import { use, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarSearch, Rocket, Send, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createMeeting, updateMeeting, deleteMeeting, fetchMeetingDetails, addComment } from "@/app/actions/meetings";
import { fetchClients, fetchSellers, fetchClientInboxes } from "@/app/actions/clients";
import { fetchCountries } from "@/app/actions/countries";
import Chip from "@/components/ui/chip";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectInput } from "@/components/ui/SelectInput";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow, format, set } from "date-fns";
import { es, is, se } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import RescheduleModal from "./RescheduleModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import Combobox from "@/components/ui/Combobox";

const heldOptionsList = [
	{ value: "-1", name: "Pendiente", color: "yellow" },

	{ value: "1", name: "Realizada", color: "green" },
	{ value: "0", name: "No Realizada", color: "red" },
];

const validatedOptionsList = [
	{ value: "-1", name: "Pendiente", color: "yellow" },
	{ value: "1", name: "Validada", color: "green" },
	{ value: "0", name: "Rechazada", color: "red" },
];

const channelOptions = [
	{ value: "EMAIL", name: "Email" },
	{ value: "CALL", name: "Llamada" },
	{ value: "WHATSAPP", name: "WhatsApp" },
	{ value: "LINKEDIN", name: "Linkedin" },
	{ value: "OTHER", name: "Otro" },
];

export default function MeetingDialog({ id, onClose, refreshData, user }) {
	const scrollRef = useRef(null);
	const heldOptions = {
		null: { label: "Pendiente", color: "yellow", value: "-1" },

		true: { label: "Realizada", color: "green", value: "1" },
		false: { label: "No Realizada", color: "red", value: "0" },
	};
	const validatedOptions = {
		null: { label: "Pendiente", color: "yellow", value: "-1" },
		true: { label: "Validada", color: "green", value: "1" },
		false: { label: "Rechazada", color: "red", value: "0" },
	};

	const { toast } = useToast();
	const [details, setDetails] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [clientOptions, setClientOptions] = useState([]);
	const [sellerOptions, setSellerOptions] = useState([]);
	const [countryOptions, setCountryOptions] = useState([]);
	const [inboxOptions, setInboxOptions] = useState([]);
	const [initialMeeting, setInitialMeeting] = useState(null);
	const [isLoadingSellers, setIsLoadingSellers] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [selectedSellers, setSelectedSellers] = useState([]);

	useEffect(() => {
		if (!isLoading && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [scrollRef.current]);

	useEffect(() => {
		const fetchOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchClients();
			const { data: countryData } = await fetchCountries();
			setCountryOptions(countryData);
			setClientOptions(data);

			if (details?.client) {
				const { data: sellerData } = await fetchSellers(details.client);

				setSellerOptions(sellerData);
			}

			setIsLoading(false);
		};

		if (user?.accountType !== "EXTERNAL") {
			fetchOptions();
		}
	}, []);

	// Fetch all sellers for the select
	useEffect(() => {
		const fetchOptions = async () => {
			if (details?.client) {
				setIsLoadingSellers(true);
				const { data: sellerData } = await fetchSellers(details.client);
				const { data: inboxData } = await fetchClientInboxes(details.client);
				setSellerOptions(sellerData);
				setInboxOptions(inboxData);
				setIsLoadingSellers(false);
			}
		};
		if (user?.accountType !== "EXTERNAL") {
			setDetails((prevDetails) => ({
				...prevDetails,
				seller: null,
			}));
			fetchOptions();
		}
	}, [details?.client]);

	const fetchDetails = async () => {
		if (id) {
			setIsLoading(true);
			const data = await fetchMeetingDetails(id);
			data.comments = data.comments.reverse();
			setInitialMeeting(data);
			setDetails({
				id: data.id,
				pod: data.pod?.id || null,
				podName: data.pod?.name,
				sdr: data.sdr?.id || null,
				sdrName: data.sdr?.name,
				client: data.client?.id || null,
				clientName: data.client?.name,
				sellers: data.sellers || [],
				country: data.country?.id || "",
				date: data.date,
				prospect: data.prospect || "",
				prospectContactRole: data.prospectContactRole || "",
				prospectContactName: data.prospectContactName || "",
				prospectContactEmail: data.prospectContactEmail || "",
				prospectContactPhone: data.prospectContactPhone || "",
				inbox: data.inbox?.id || "",
				channel: data.channel || "",
				validated: validatedOptions[data.validated].value,
				held: heldOptions[data.held].value,
			});
			setIsLoading(false);
		} else {
			// Nuevo ítem, limpia el formulario
			setDetails({
				id: null,
				pod: null,
				sdr: null,
				client: null,
				sellers: [],
				country: "",
				date: null,
				prospect: "",
				prospectContactRole: "",
				prospectContactName: "",
				prospectContactEmail: "",
				prospectContactPhone: "",
				inbox: "",
				channel: "",
				validated: "",
				held: "",
			});
		}
	};

	useEffect(() => {
		fetchDetails();
	}, [id, fetchMeetingDetails]);

	// Manejo del envío del formulario para guardar
	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);
		if (id) {
			const { data, error } = await updateMeeting(details);

			if (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al actualizar la reunión",
					variant: "destructive",
				});
				setIsLoading(false);
			} else {
				toast({
					title: "Reunión actualizado correctamente",
					variant: "success",
				});
				setIsLoading(false);
				onClose(); // Cierra el diálogo tras guardar
				refreshData(); // Actualiza la lista de datos
			}
		} else {
			const { data, error } = await createMeeting(details);
			if (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al crear la reunión",
					variant: "destructive",
				});
				setIsLoading(false);
			} else {
				toast({
					title: "Reunión creada correctamente",
					variant: "success",
				});
				setIsLoading(false);
				onClose(); // Cierra el diálogo tras guardar
				refreshData(); // Actualiza la lista de datos
			}
		}
	};

	// Manejo de eliminación
	const handleDelete = async () => {
		if (id) {
			setIsLoading(true);
			const { error } = await deleteMeeting(id);
			if (error) {
				toast({
					title: "Error",
					description: "Ocurrió un error al eliminar la reunión",
					variant: "destructive",
				});
				setIsLoading(false);
			} else {
				toast({
					title: "Reunión eliminado correctamente",
					variant: "success",
				});
				setIsLoading(false);
				onClose();
				refreshData();
			}
		}
	};

	// Manejo de cambios en el formulario
	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	const handleAddComment = async () => {
		if (!details || !details.id) return;

		const { data, error } = await addComment({ meetingId: details.id, text: newComment });
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al agregar el comentario",
				variant: "destructive",
			});
		} else {
			toast({
				title: "Comentario agregado correctamente",
				variant: "success",
			});
			setNewComment("");
			fetchDetails();
		}
	};

	const disableSave =
		isLoading ||
		!details ||
		!details.client ||
		!details.sellers ||
		!details.date ||
		!details.prospect ||
		!details.prospectContactName ||
		!details.prospectContactEmail ||
		!details.prospectContactRole ||
		!details.country ||
		!details.inbox ||
		!details.channel;

	if (isLoading || (id && !details)) {
		return (
			<div className="flex flex-col justify-center items-center gap-1 text-center py-4">
				<Rocket className="size-6 animate-bounce " />
				<p> Cargando...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 pt-6 ">
			<div className="flex justify-between items-center gap-4 px-4">
				<div className="flex flex-col px-4 gap-1">
					<p className="font-semibold text text-lg flex gap-2 items-center">
						{id
							? `Reunión ${initialMeeting?.client?.name} - ${initialMeeting?.prospect} ${
									initialMeeting?.recovered ? "[REAGENDADA]" : ""
							  }`
							: "Nueva reunión"}
					</p>

					<div className="flex gap-2 items-center justify-between flex-wrap">
						<div className="flex gap-2 items-center">
							<p className="text-gray-500 text-sm">
								{initialMeeting?.id
									? format(initialMeeting?.date.replace("Z", ""), "PPP - HH:mm", {
											locale: es,
									  })
									: "Ingresa los siguientes campos para crear/actualizar una reunión"}
							</p>
							{initialMeeting?.id && (
								<Chip variant="outline" color={heldOptions[initialMeeting.held].color}>
									{heldOptions[initialMeeting.held].label}
								</Chip>
							)}
							{initialMeeting?.id && (
								<Chip variant="outline" color={validatedOptions[initialMeeting.validated].color}>
									{validatedOptions[initialMeeting.validated].label}
								</Chip>
							)}
						</div>
						{user?.accountType !== "EXTERNAL" && (
							<div className="flex gap-2 items-center">
								{initialMeeting?.id && (
									<Chip variant="outline" color="indigo">
										Pod: {initialMeeting?.pod?.name || "Sin Pod"} - SDR:{" "}
										{initialMeeting?.sdr?.name || "Sin SDR"}
									</Chip>
								)}
							</div>
						)}
					</div>

					{initialMeeting?.id && initialMeeting?.sellers.length > 0 && (
						<div className="flex gap-2 items-center flex-wrap">
							<p className="text-sm text-gray-500">Ejecutivos:</p>
							{initialMeeting?.sellers.map((seller, idx) => (
								<p className="text-sm text-gray-500" key={seller.id}>
									{initialMeeting?.sellers.length === idx + 1 ? `${seller.name},` : `${seller.name} `}
								</p>
							))}
						</div>
					)}
					{/* {initialMeeting?.id && initialMeeting?.held === false && user?.accountType !== "EXTERNAL" && (
						<div>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setRescheduleModalOpen(true)}
								disabled={initialMeeting?.held === true || initialMeeting?.validated === true}
							>
								<CalendarSearch className="mr-2" /> Reagendar
							</Button>
						</div>
					)} */}
				</div>

				{user?.accountType === "EXTERNAL" && (
					<div className="flex flex-col px-6">
						<p className="text-sm font-medium">Info prospecto:</p>
						<p className="text-sm text-gray-500">
							{initialMeeting?.prospectContactName}{" "}
							{initialMeeting?.propspectContactRole && `- ${initialMeeting?.propspectContactRole}`}
						</p>
						<p className="text-sm text-gray-500">{initialMeeting?.prospectContactEmail}</p>
						<p className="text-sm text-gray-500">{initialMeeting?.prospectContactPhone}</p>
					</div>
				)}
			</div>

			<Separator />

			<div className="flex flex-col gap-1 w-full md:flex-row">
				{user?.accountType !== "EXTERNAL" && (
					<form
						onSubmit={handleSave}
						className={cn(
							"flex flex-col gap-6  justify-between",

							!id ? "w-full" : "md:w-3/5"
						)}
					>
						<div className="flex flex-col gap-3 px-4">
							{/* Client & Seller */}
							{!initialMeeting?.id && (
								<div className="flex gap-3 flex-col sm:flex-row">
									{/* Client */}
									
									<Combobox
										label="Cliente*"
										placeholder="Selecciona un cliente"
										items={clientOptions.map((client) => ({ id: client.id, name: client.name })) || []}
										value={details?.client || ""}
										onChange={(value) => handleChange("client", value)}
										disabled={isLoading}
										isLoading={isLoading}
										className="w-full"
										
									/>
									{!id && (
									<DatePicker
										label
										value={details?.date}
										onChange={(date) => handleChange("date", date)}
										placeholder="Fecha de la reunión"
										buttonClassName="custom-button-styles"
										calendarProps={{ minDate: new Date() }}
										disabled={isLoading || id}
										timePicker={true}
										className="w-full"
									/>
								)}

								</div>
							)}

							{!initialMeeting?.id && (
								<div className="flex gap-3 flex-col sm:flex-row">
									<MultiSelect
										label="Ejecutivos"
										options={sellerOptions}
										selected={details?.sellers}
										onChange={(value) => handleChange("sellers", value)}
										disabled={!details?.client || isLoadingSellers}
										className="w-full"
										isLoading={isLoadingSellers}
									/>
									<Combobox
										label="Bandeja*"
										placeholder="Selecciona una bandeja"
										items={inboxOptions.map((inbox) => ({ id: inbox.id, name: inbox.email })) || []}
										value={details?.inbox || ""}
										onChange={(value) => handleChange("inbox", value)}
										disabled={user?.accountType === "EXTERNAL" || !details?.client || isLoadingSellers}
										isLoading={isLoadingSellers}
										className="w-full"
									
								/>
								</div>
							)}

							{/* Prospect */}

							<div className="flex gap-3 flex-col sm:flex-row">
								<Input
									label="Nombre empresa*"
									value={details?.prospect}
									onChange={(e) => handleChange("prospect", e.target.value)}
									disabled={user?.accountType === "EXTERNAL"}
									className="w-full"
								/>
								
							</div>

							<div className="flex gap-3 flex-col sm:flex-row">
								<Input
									label="Nombre de contacto*"
									value={details?.prospectContactName}
									onChange={(e) => handleChange("prospectContactName", e.target.value)}
								/>

								<Input
									label="Email de contacto*"
									value={details?.prospectContactEmail}
									onChange={(e) => handleChange("prospectContactEmail", e.target.value)}
									className="w-full"
								/>
							</div>
							<div className="flex gap-3 flex-col sm:flex-row">
								<PhoneInput
									value={details?.prospectContactPhone}
									onChange={(value) => handleChange("prospectContactPhone", value)}
									defaultCountry={"CL"}
									international
								/>
								<Input
									label="Cargo de contacto*"
									value={details?.prospectContactRole}
									onChange={(e) => handleChange("prospectContactRole", e.target.value)}
								/>
							</div>

							<div className="flex gap-3 flex-col sm:flex-row">
								
								<Combobox
									label="País*"
									placeholder="Selecciona un país"
									items={countryOptions.map((country) => ({ id: country.id, name: country.name })) || []}
									value={details?.country || ""}
									onChange={(value) => handleChange("country", value)}
									disabled={user?.accountType === "EXTERNAL"}
									isLoading={isLoading}
									className="w-full"
								/>
								
								
									
		
							</div>

							<div className="flex gap-3 flex-col sm:flex-row">
								<SelectInput
									label="Canal*"
									value={details?.channel}
									options={channelOptions}
									onChange={(value) => handleChange("channel", value)}
									disabled={user?.accountType === "EXTERNAL"}
									className="w-full"
								/>
							</div>

							{details?.id &&
								(user?.role === "SDR" || user?.role === "MANAGER" || user.accountType === "ADMIN") && (
									<div className="flex gap-3 flex-col sm:flex-row">
										{user?.accountType === "ADMIN" && (
											<SelectInput
												label="Realizada?"
												value={details?.held}
												options={heldOptionsList}
												onChange={(value) => handleChange("held", value)}
												disabled={user?.accountType === "EXTERNAL"}
												className="w-full"
											/>
										)}
										{(user?.role === "MANAGER" || user.accountType === "ADMIN") && (
											<SelectInput
												label="Validada?"
												value={details?.validated}
												options={validatedOptionsList}
												onChange={(value) => handleChange("validated", value)}
												className="w-full"
											/>
										)}
									</div>
								)}
						</div>
					</form>
				)}

				{/* Comments */}
				{id && (
					<div
						className={cn(
							"flex flex-col gap-1 mt-2 md:mt-0 px-4 md:pl-2 h-[200px] md:h-full md:max-h-[390px] mb-4 md:mb-0",
							user?.accountType === "EXTERNAL" ? "w-full" : "md:w-2/5"
						)}
					>
						{/* <h2 className="text-gray-500 font-medium text-sm">Comentarios</h2> */}
						<label className={`text-sm font-medium text-muted-foreground px-1 `}>Comentarios</label>

						<div className="flex flex-col justify-between gap-3  bg-gray-200 p-2 rounded-lg h-full">
							<div
								ref={scrollRef}
								className="flex flex-col h-[350px] overflow-y-auto gap-2 no-scrollbar "
							>
								{initialMeeting?.comments?.map((comment) => (
									<div
										key={comment.id}
										className={cn(
											"flex flex-col p-2 rounded-lg",
											"bg-gray-100",
											comment.author === "SYSTEM" && "bg-gray-300",
											comment.author === "SDR" && "bg-indigo-200",
											comment.author === "CLIENT" && "bg-green-200",
											comment.author === "MANAGER" && "bg-orange-200"
										)}
									>
										<div className="flex gap-1 items-center">
											<p className="font-semibold text-xs">{comment.author}</p>
											<p className="text-[10px] text-gray-500">
												{formatDistanceToNow(new Date(comment.createdAt), {
													addSuffix: true,
													locale: es,
												})}
											</p>
										</div>
										<p className="text-xs">{comment.text}</p>
									</div>
								))}
							</div>

							<Textarea
								placeholder="Escribe un comentario"
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								send={handleAddComment}
							/>
						</div>
					</div>
				)}
			</div>

			{/* <Separator className="mt-6" /> */}

			{/* Buttons */}
			<div className="sticky bg-white bottom-0 border-t border-gray-100 flex justify-between gap-4 px-4 py-6">
				{id ? (
					<Button
						className="bg-red-100 border-none text-red-600 hover:bg-red-200 hover:text-red-600"
						variant="outline"
						onClick={handleDelete}
						type="button"
						disabled={isLoading || !id || !details || !details.id || user?.accountType === "EXTERNAL"}
					>
						<Trash2 className="text-red-600" /> Eliminar
					</Button>
				) : (
					<div className="invisible">Hidden</div>
				)}

				<div className="flex gap-4">
					<Button variant="outline" onClick={onClose} type="button">
						Cancelar
					</Button>
					<Button type="submit" disabled={disableSave} onClick={handleSave}>
						{id ? "Guardar" : "Crear reunión"}
					</Button>
				</div>
			</div>

			{/* {initialMeeting?.id && (
				<Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
					<DialogContent className="flex flex-col gap-6 pt-6">
						<DialogHeader>
							<DialogTitle>Reagendar reunión</DialogTitle>
							<DialogDescription>
								Selecciona una nueva fecha y hora para reagendar la reunión.
							</DialogDescription>
						</DialogHeader>

						<RescheduleModal
							meetingId={initialMeeting?.id}
							open={true}
							onClose={() => setRescheduleModalOpen(false)}
							onOpenChange={setRescheduleModalOpen}
							// refreshData={() => setRefreshData(!refreshData)}
						/>
					</DialogContent>
				</Dialog>
			)} */}
		</div>
	);
}
