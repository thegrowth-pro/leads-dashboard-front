"use client";

import { use, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateMeeting, deleteMeeting, fetchMeetingDetails, addComment } from "@/app/actions/meetings";
import { fetchClients, fetchSellers, fetchClientInboxes } from "@/app/actions/clients";
import { fetchCountries } from "@/app/actions/countries";
import Chip from "@/components/ui/chip";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectInput } from "@/components/ui/SelectInput";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { MultiSelect } from "@/components/ui/multi-select";
import Combobox from "@/components/ui/Combobox";
import useSessionStore from "@/app/store/session";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";
import CommentsModal from "@/components/CommentsModal";
import DynamicField from "@/components/forms/DynamicField";

const validatedOptionsList = [
	{ name: "Pendiente", color: "yellow", value: null },
	{ name: "Validada", color: "green", value: true },
	{ name: "Rechazada", color: "red", value: false },
];

const heldOptionsList = [
	{ name: "Pendiente", color: "yellow", value: null },
	{ name: "Realizada", color: "green", value: true },
	{ name: "No Realizada", color: "red", value: false },
];

const channelOptions = [
	{ value: "EMAIL", name: "Email" },
	{ value: "CALL", name: "Llamada" },
	{ value: "HOT_CALL", name: "Llamada en tibio" },
	{ value: "WHATSAPP", name: "WhatsApp" },
];

export default function MeetingDetails({ params }) {
	const { toast } = useToast();
	const { isOpen, dialogConfig, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
	const { session } = useSessionStore();
	const router = useRouter();

	// Unwrap params
	const unwrappedParams = use(params);

	const [details, setDetails] = useState(null);
	const [initialMeeting, setInitialMeeting] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [clientOptions, setClientOptions] = useState([]);
	const [countryOptions, setCountryOptions] = useState([]);
	const [sellerOptions, setSellerOptions] = useState([]);
	const [inboxOptions, setInboxOptions] = useState([]);
	const [isLoadingSellers, setIsLoadingSellers] = useState(false);
	const [refreshDetails, setRefreshDetails] = useState(false);
	const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
	const [isSendingComment, setIsSendingComment] = useState(false);
	
	// Estados para campos dinámicos
	const [dynamicFieldValues, setDynamicFieldValues] = useState({});
	const [dynamicFieldErrors, setDynamicFieldErrors] = useState({});

	// Fetch options data
	useEffect(() => {
		const fetchOptions = async () => {
			setIsLoading(true);
			const { data: clientsData } = await fetchClients();
			const { data: countriesData } = await fetchCountries();
			setClientOptions(clientsData);
			setCountryOptions(countriesData);
			setIsLoading(false);
		};

		if (session?.accountType !== "EXTERNAL") {
			fetchOptions();
		}
	}, []);

	// Fetch meeting details
	useEffect(() => {
		const fetchDetails = async () => {
			if (unwrappedParams.id && session) {
				setIsLoading(true);
				const { data, error } = await fetchMeetingDetails(unwrappedParams.id);
				if (error) {
					router.push("/not-found");
				}
				data.comments = data?.comments ? data.comments.reverse() : [];
				setDetails({
					id: data?.id || null,
					pod: data?.pod?.id || null,
					podName: data?.pod?.name,
					sdr: data?.sdr?.id || null,
					sdrName: data?.sdr?.name,
					client: data?.client?.id || null,
					clientName: data?.client?.name,
					sellers:
						session?.accountType === "EXTERNAL"
							? data?.sellers?.map((seller) => seller.name)
							: data?.sellers?.map((seller) => seller.id) || [],
					country: data?.country?.id || "",
					date: data?.date.replace("Z", ""),
					prospect: data?.prospect || "",
					prospectContactRole: data?.prospectContactRole || "",
					prospectContactName: data?.prospectContactName || "",
					prospectContactEmail: data?.prospectContactEmail || "",
					prospectContactPhone: data?.prospectContactPhone || "",
					inbox: data?.inbox?.id || "",
					channel: data?.channel || "",
					validated: data?.validated,
					held: data?.held,
					comments: data?.comments || [],
				});
				setInitialMeeting(data);
				
				// Inicializar valores de campos dinámicos
				if (data?.additionalFields) {
					setDynamicFieldValues(data.additionalFields);
				} else {
					setDynamicFieldValues({});
				}
				
				setIsLoading(false);
			}
		};
		fetchDetails();
	}, [unwrappedParams.id, refreshDetails, session]);

	// Fetch sellers and inboxes when client changes
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
		if (session?.accountType !== "EXTERNAL") {
			fetchOptions();
		}
	}, [details?.client]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		// Validar campos dinámicos requeridos
		const errors = {};
		if (initialMeeting?.form?.fields) {
			initialMeeting.form.fields.forEach(field => {
				if (field.label !== '¿Generar link de Google Meet?') { // Excluir Google Meet de validación
					const value = dynamicFieldValues[field.id];
					if (field.required && (value === undefined || value === '' || value === null)) {
						errors[field.id] = `${field.label} es obligatorio`;
					}
				}
			});
		}

		if (Object.keys(errors).length > 0) {
			setDynamicFieldErrors(errors);
			toast({
				title: "Error",
				description: "Por favor completa todos los campos obligatorios",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		
		// Incluir campos adicionales en los datos a enviar
		const updatedDetails = {
			...details,
			additionalFields: Object.keys(dynamicFieldValues).length > 0 ? dynamicFieldValues : null
		};
		
		const { data, error } = await updateMeeting(updatedDetails);

		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al actualizar la reunión",
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			toast({
				title: "Reunión actualizada correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleDelete = () => {
		openDialog({
			title: "Eliminar Reunión",
			description: "¿Estás seguro de que deseas eliminar esta reunión?",
			confirmText: "Eliminar",
			onConfirm: async () => {
				if (unwrappedParams.id) {
					setIsLoading(true);
					const { error } = await deleteMeeting(unwrappedParams.id);
					if (error) {
						toast({
							title: "Error",
							description: "Ocurrió un error al eliminar la reunión",
							variant: "destructive",
						});
						setIsLoading(false);
					} else {
						toast({
							title: "Reunión eliminada correctamente",
							variant: "success",
						});
						setIsLoading(false);
						router.push("/meetings");
					}
				}
			}
		});
	};

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
	};

	// Manejo de cambios en campos dinámicos
	const handleDynamicFieldChange = (fieldKey, value) => {
		setDynamicFieldValues(prev => ({
			...prev,
			[fieldKey]: value
		}));
		
		// Limpiar error si existe
		if (dynamicFieldErrors[fieldKey]) {
			setDynamicFieldErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[fieldKey];
				return newErrors;
			});
		}
	};

	const handleAddComment = async (newComment) => {
		if (!details || !details.id) return;
		setIsSendingComment(true);
		const { data, error } = await addComment({ meetingId: details.id, text: newComment });
		if (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al agregar el comentario",
				variant: "destructive",
			});
			setIsSendingComment(false);
		} else {
			setDetails((prevDetails) => ({
				...prevDetails,
				comments: [
					...prevDetails.comments,
					{
						id: Math.random().toString(36).substring(2, 15),
						text: newComment,
						author: session?.isAdmin
							? "ADMIN"
							: session?.accountType === "EXTERNAL"
							? "CLIENT"
							: session?.role,
						createdAt: new Date(),
					},
				],
			}));
			toast({
				title: "Comentario agregado correctamente",
				variant: "success",
			});
			setIsSendingComment(false);
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

	if (isLoading || !details || !initialMeeting) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Detalles de la reunión</h2>
				<div className="flex gap-2 items-center mt-2">
					<p className="text-gray-500 text-sm">
						{format(new Date(details.date), "PPP - HH:mm", {
							locale: es,
						})}
					</p>
					<Chip
						variant="outline"
						color={heldOptionsList.find((opt) => opt.value === initialMeeting.held)?.color}
					>
						{heldOptionsList.find((opt) => opt.value === initialMeeting.held)?.name}
					</Chip>
					<Chip
						variant="outline"
						color={validatedOptionsList.find((opt) => opt.value === initialMeeting.validated)?.color}
					>
						{validatedOptionsList.find((opt) => opt.value === initialMeeting.validated)?.name}
					</Chip>
				</div>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex gap-3 flex-col sm:flex-row">
					<Input label="Cliente" value={details.clientName || ""} disabled className="w-full" />
					<DatePicker
						label="Fecha de la reunión"
						value={details.date}
						onChange={(date) => handleChange("date", date)}
						disabled={true}
						timePicker={true}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<MultiSelect
						label="Ejecutivos"
						options={sellerOptions}
						selected={details?.sellers || []}
						onChange={(value) => handleChange("sellers", value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full"
						isLoading={isLoadingSellers}
					/>
					<Combobox
						label="Bandeja"
						placeholder="Selecciona una bandeja"
						items={inboxOptions.map((inbox) => ({ id: inbox.id, name: inbox.email })) || []}
						value={details.inbox || ""}
						onChange={(value) => handleChange("inbox", value)}
						disabled={session?.accountType === "EXTERNAL"}
						isLoading={isLoadingSellers}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<Input
						label="Nombre empresa"
						value={details.prospect}
						onChange={(e) => handleChange("prospect", e.target.value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full flex-1"
					/>
					<Combobox
						label="País"
						placeholder="Selecciona un país"
						items={countryOptions.map((country) => ({ id: country.id, name: country.name })) || []}
						value={details.country || ""}
						onChange={(value) => handleChange("country", value)}
						disabled={session?.accountType === "EXTERNAL"}
						isLoading={isLoading}
						className="w-full flex-1"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<Input
						label="Nombre de contacto"
						value={details.prospectContactName}
						onChange={(e) => handleChange("prospectContactName", e.target.value)}
					/>
					<Input
						label="Email de contacto"
						value={details.prospectContactEmail}
						onChange={(e) => handleChange("prospectContactEmail", e.target.value)}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<PhoneInput
						value={details.prospectContactPhone}
						onChange={(value) => handleChange("prospectContactPhone", value)}
						defaultCountry={"CL"}
					/>
					<Input
						label="Cargo de contacto"
						value={details.prospectContactRole}
						onChange={(e) => handleChange("prospectContactRole", e.target.value)}
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<SelectInput
						label="Canal"
						value={details.channel}
						options={channelOptions}
						onChange={(value) => handleChange("channel", value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full"
					/>
				</div>

				{session?.role === "SDR" || session?.role === "MANAGER" || session.accountType === "ADMIN" ? (
					<div className="flex gap-3 flex-col sm:flex-row">
						<SelectInput
							label="Realizada?"
							value={details.held}
							options={heldOptionsList}
							onChange={(value) => handleChange("held", value)}
							disabled={session?.accountType === "EXTERNAL" || session?.role === "SDR"}
							className="w-full"
						/>
						<SelectInput
							label="Validada?"
							value={details.validated}
							options={validatedOptionsList}
							onChange={(value) => handleChange("validated", value)}
							disabled={session?.accountType === "EXTERNAL" || session?.role === "SDR"}
							className="w-full"
						/>
					</div>
				) : null}

				{initialMeeting?.form?.fields && initialMeeting.form.fields.length > 0 && (
					<div className="space-y-4">
						<div className="border-t pt-4">
							<h3 className="text-lg font-semibold mb-4">Información adicional</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{initialMeeting.form.fields
									.sort((a, b) => a.order - b.order)
									.filter(field => field.label !== '¿Generar link de Google Meet?')
									.map((field) => {
										const value = dynamicFieldValues[field.id];
										
										return (
											<DynamicField
												key={field.id}
												field={field}
												value={value}
												onChange={handleDynamicFieldChange}
												error={dynamicFieldErrors[field.id]}
												disabled={session?.accountType === "EXTERNAL"}
											/>
										);
									})}
							</div>
						</div>
					</div>
				)}

				{/* Campo de Google Meet */}
				{initialMeeting?.generateGoogleMeetLink !== undefined && (
					<div className="border-t pt-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="generate_google_meet_link"
								checked={Boolean(initialMeeting.generateGoogleMeetLink)}
								disabled={true}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded"
							/>
							<label
								htmlFor="generate_google_meet_link"
								className="text-sm font-medium leading-none"
							>
								¿Generar link de Google Meet?
							</label>
						</div>
						<p className="text-xs text-gray-500 mt-1 ml-6">
							{initialMeeting.generateGoogleMeetLink 
								? "Se generó automáticamente un enlace de Google Meet para esta reunión"
								: "No se generó enlace de Google Meet para esta reunión"
							}
						</p>
					</div>
				)}
			</div>

			<div className="flex justify-between gap-4 w-full px-4 py-4 border-t border-gray-300 bg-background mt-auto">
				{session?.accountType !== "EXTERNAL" && (
					<Button
						className="bg-red-100 border-none text-red-600 hover:bg-red-200 hover:text-red-600"
						variant="outline"
						onClick={handleDelete}
						type="button"
						disabled={isLoading}
					>
						<Trash2 className="text-red-600" /> Eliminar
					</Button>
				)}
				<div className="flex gap-2 w-full justify-end">
					<Button
						className="bg-indigo-100 border-none text-indigo-600 hover:bg-indigo-200 hover:text-indigo-600"
						variant="outline"
						onClick={() => setIsCommentsModalOpen(true)}
						type="button"
					>
						<MessageSquare className="h-4 w-4" />
						Comentarios ({details.comments?.length || 0})
					</Button>
					<Button type="submit" disabled={disableSave} onClick={handleSave}>
						<Save className="size-4" />
						<p className="hidden sm:flex">Guardar</p>
					</Button>
				</div>
			</div>

			<CommentsModal
				isOpen={isCommentsModalOpen}
				onClose={() => setIsCommentsModalOpen(false)}
				comments={details.comments}
				onAddComment={handleAddComment}
				isLoading={isLoading || isSendingComment}
			/>

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
