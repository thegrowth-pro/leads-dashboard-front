"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createMeeting } from "@/app/actions/meetings";
import { fetchClients, fetchSellers, fetchClientInboxes } from "@/app/actions/clients";
import { fetchCountries } from "@/app/actions/countries";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(main)/loading";
import { DatePicker } from "@/components/ui/DatePicker";
import { SelectInput } from "@/components/ui/SelectInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { MultiSelect } from "@/components/ui/multi-select";
import Combobox from "@/components/ui/Combobox";
import useSessionStore from "@/app/store/session";
import { formatDatetoISO } from "@/lib/utils";
const channelOptions = [
	{ value: "EMAIL", name: "Email" },
	{ value: "CALL", name: "Llamada" },
	{ value: "HOT_CALL", name: "Llamada en tibio" },
	{ value: "WHATSAPP", name: "WhatsApp" },
];

export default function NewMeeting() {
	const { toast } = useToast();
	const { session } = useSessionStore();
	const [details, setDetails] = useState({
		client: null,
		date: null,
		sellers: [],
		inbox: null,
		prospect: "",
		prospectContactName: "",
		prospectContactEmail: "",
		prospectContactPhone: "",
		prospectContactRole: "",
		country: null,
		channel: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [clientOptions, setClientOptions] = useState([]);
	const [sellerOptions, setSellerOptions] = useState([]);
	const [countryOptions, setCountryOptions] = useState([]);
	const [inboxOptions, setInboxOptions] = useState([]);
	const [isLoadingSellers, setIsLoadingSellers] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchOptions = async () => {
			setIsLoading(true);
			const { data } = await fetchClients();
			const { data: countryData } = await fetchCountries();
			setCountryOptions(countryData);
			setClientOptions(data);
			setIsLoading(false);
		};

		if (session?.accountType !== "EXTERNAL") {
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
		if (session?.accountType !== "EXTERNAL") {
			setDetails((prevDetails) => ({
				...prevDetails,
				seller: null,
			}));
			fetchOptions();
		}
	}, [details?.client]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		setIsLoading(true);
		details.date = formatDatetoISO(details.date);
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
			router.push(`/meetings/${data.id}`);
		}
	};

	// Manejo de cambios en el formulario
	const handleChange = (field, value) => {
		setDetails((prevDetails) => ({
			...prevDetails,
			[field]: value,
		}));
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

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nueva reunión</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear una nueva reunión</p>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex gap-3 flex-col sm:flex-row">
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
					<DatePicker
						label
						value={details?.date}
						onChange={(date) => handleChange("date", date)}
						placeholder="Fecha de la reunión"
						buttonClassName="custom-button-styles"
						calendarProps={{ minDate: new Date() }}
						disabled={isLoading}
						timePicker={true}
						className="w-full"
					/>
				</div>

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
						disabled={session?.accountType === "EXTERNAL" || !details?.client || isLoadingSellers}
						isLoading={isLoadingSellers}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<Input
						label="Nombre empresa*"
						value={details?.prospect}
						onChange={(e) => handleChange("prospect", e.target.value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full flex-1"
					/>
					<Combobox
						label="País*"
						placeholder="Selecciona un país"
						items={countryOptions.map((country) => ({ id: country.id, name: country.name })) || []}
						value={details?.country || ""}
						onChange={(value) => handleChange("country", value)}
						disabled={session?.accountType === "EXTERNAL"}
						isLoading={isLoading}
						className="w-full flex-1"
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
					<SelectInput
						label="Canal*"
						value={details?.channel}
						options={channelOptions}
						onChange={(value) => handleChange("channel", value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full"
					/>
				</div>
			</div>

			<div className="sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 w-full px-4 py-4 border-t border-gray-300 bg-background">
				<Button type="submit" disabled={disableSave || isLoading} onClick={handleSave}>
					{isLoading ? "Cargando..." : "Crear reunión"}
				</Button>
			</div>

			{isLoading && <Loading />}
		</div>
	);
}
