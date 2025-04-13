"use client";

import { use, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
	{ value: "COLD_CALL", name: "Llamada en frío" },
	{ value: "HOT_CALL", name: "Llamada en caliente" },
	{ value: "WHATSAPP", name: "WhatsApp" },
	{ value: "LINKEDIN", name: "Linkedin" },
	{ value: "OTHER", name: "Otro" },
];

export default function MeetingDetails({ params }) {
	const { toast } = useToast();
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
					date: data?.date,
					prospect: data?.prospect || "",
					prospectContactRole: data?.prospectContactRole || "",
					prospectContactName: data?.prospectContactName || "",
					prospectContactEmail: data?.prospectContactEmail || "",
					prospectContactPhone: data?.prospectContactPhone || "",
					inbox: data?.inbox?.id || "",
					channel: data?.channel || "",
					validated: validatedOptionsList.find((opt) => opt.value === data?.validated)?.value || "-1",
					held: heldOptionsList.find((opt) => opt.value === data?.held)?.value || "-1",
					comments: data?.comments || [],
				});
				setInitialMeeting(data);
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

		setIsLoading(true);
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
				title: "Reunión actualizada correctamente",
				variant: "success",
			});
			setIsLoading(false);
			setRefreshDetails(!refreshDetails);
		}
	};

	const handleDelete = async () => {
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
	};

	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
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
						{format(new Date(details.date.replace("Z", "")), "PPP - HH:mm", {
							locale: es,
						})}
					</p>
					<Chip variant="outline" color={heldOptionsList.find((opt) => opt.value === details.held)?.color}>
						{heldOptionsList.find((opt) => opt.value === details.held)?.name}
					</Chip>
					<Chip
						variant="outline"
						color={validatedOptionsList.find((opt) => opt.value === details.validated)?.color}
					>
						{validatedOptionsList.find((opt) => opt.value === details.validated)?.name}
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
						disabled={session?.accountType === "EXTERNAL"}
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
						international
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
						{session?.accountType === "ADMIN" && (
							<SelectInput
								label="Realizada?"
								value={details.held}
								options={heldOptionsList}
								onChange={(value) => handleChange("held", value)}
								disabled={session?.accountType === "EXTERNAL"}
								className="w-full"
							/>
						)}
						{(session?.role === "MANAGER" || session.accountType === "ADMIN") && (
							<SelectInput
								label="Validada?"
								value={details.validated}
								options={validatedOptionsList}
								onChange={(value) => handleChange("validated", value)}
								className="w-full"
							/>
						)}
					</div>
				) : null}
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

			{isLoading && <Loading />}
		</div>
	);
}
