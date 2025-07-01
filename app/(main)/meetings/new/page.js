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
import { PhoneInput, combinePhoneNumber, parsePhoneNumber } from "@/components/ui/PhoneInput";
import { MultiSelect } from "@/components/ui/multi-select";
import Combobox from "@/components/ui/Combobox";
import useSessionStore from "@/app/store/session";
import { formatDatetoISO } from "@/lib/utils";
import DynamicField from "@/components/forms/DynamicField";
import { fetchActiveFormByClient } from "@/app/actions/forms";
import { Checkbox } from "@/components/ui/checkbox";
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
	const [activeForm, setActiveForm] = useState(null);
	const [dynamicFieldValues, setDynamicFieldValues] = useState({});
	const [dynamicFieldErrors, setDynamicFieldErrors] = useState({});
	const router = useRouter();
	const [prospectContactPhone, setProspectContactPhone] = useState("");

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

	// Fetch all sellers for the select and active form
	useEffect(() => {
		const fetchOptions = async () => {
			if (details?.client) {
				setIsLoadingSellers(true);
				const [sellersResponse, inboxesResponse, formResponse] = await Promise.all([
					fetchSellers(details.client),
					fetchClientInboxes(details.client),
					fetchActiveFormByClient(details.client)
				]);
				
				setSellerOptions(sellersResponse.data);
				setInboxOptions(inboxesResponse.data);
				
				if (formResponse.data) {
					setActiveForm(formResponse.data);
					const initialValues = {
						generate_google_meet_link: true // Valor por defecto para Google Meet
					};
					formResponse.data.fields?.forEach(field => {
						// Usar directamente el ID del campo como clave estable
						const fieldKey = field.id;
						
						// Inicializar valores por defecto para diferentes tipos de campos
						switch (field.type) {
							case 'BOOLEAN':
								initialValues[fieldKey] = false;
								break;
							case 'STRING':
								initialValues[fieldKey] = '';
								break;
							case 'NUMBER':
								initialValues[fieldKey] = '';
								break;
							case 'LIST':
								initialValues[fieldKey] = '';
								break;
							default:
								initialValues[fieldKey] = '';
						}
					});
					setDynamicFieldValues(initialValues);
				} else {
					// Si no hay formulario activo, solo inicializar Google Meet
					setActiveForm(null);
					setDynamicFieldValues({
						generate_google_meet_link: true
					});
				}
				
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

	// Función para combinar el código de país y número cuando cambien los valores separados
	useEffect(() => {
		if (details?.prospectCountryCode && details?.prospectPhoneNumber) {
			const fullPhone = combinePhoneNumber(details.prospectCountryCode, details.prospectPhoneNumber);
			setProspectContactPhone(fullPhone);
		}
	}, [details?.prospectCountryCode, details?.prospectPhoneNumber]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (!details) return;

		// Validate dynamic fields
		const errors = {};
		if (activeForm?.fields) {
			activeForm.fields.forEach(field => {
				// Usar directamente el ID del campo como clave estable
				const fieldKey = field.id;
				
				const value = dynamicFieldValues[fieldKey];
				if (field.required && (value === undefined || value === '' || value === null)) {
					errors[fieldKey] = `${field.label} es obligatorio`;
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
		const meetingData = {
			...details,
			date: formatDatetoISO(details.date),
			additionalFields: Object.keys(dynamicFieldValues).length > 0 ? dynamicFieldValues : null,
			generateGoogleMeetLink: dynamicFieldValues.generate_google_meet_link ?? true
		};

		const { data, error } = await createMeeting(meetingData);

		if (error) {
			toast({
				title: "Error",
				description: error.message || "Ocurrió un error al crear la reunión",
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

	// Manejo de cambios en campos dinámicos
	const handleDynamicFieldChange = (fieldKey, value) => {
		setDynamicFieldValues(prev => ({
			...prev,
			[fieldKey]: value
		}));
		
		if (dynamicFieldErrors[fieldKey]) {
			setDynamicFieldErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[fieldKey];
				return newErrors;
			});
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

	return (
		<div className="flex flex-col gap-4 pt-4 w-full h-full">
			<div className="flex flex-col px-4 pb-4 border-b border-gray-300">
				<h2 className="text-xl font-semibold">Nueva reunión</h2>
				<p className="text-muted-foreground">Ingresa los siguientes campos para crear una nueva reunión</p>
			</div>

			<div className="flex flex-col gap-4 w-full px-4 h-full overflow-y-auto justify-start">
				<div className="flex gap-3 flex-col sm:flex-row">
					<Combobox
						label={<span>Cliente <span className="text-red-500">*</span></span>}
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
						label={<span>Bandeja <span className="text-red-500">*</span></span>}
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
						label={<span>Nombre empresa <span className="text-red-500">*</span></span>}
						value={details?.prospect}
						onChange={(e) => handleChange("prospect", e.target.value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full flex-1"
					/>
					<Combobox
						label={<span>País <span className="text-red-500">*</span></span>}
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
						label={<span>Nombre de contacto <span className="text-red-500">*</span></span>}
						value={details?.prospectContactName}
						onChange={(e) => handleChange("prospectContactName", e.target.value)}
					/>

					<Input
						label={<span>Email de contacto <span className="text-red-500">*</span></span>}
						value={details?.prospectContactEmail}
						onChange={(e) => handleChange("prospectContactEmail", e.target.value)}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<PhoneInput
						countryLabel="Código"
						phoneLabel="Teléfono"
						value={details?.prospectContactPhone || ""}
						onChange={(fullPhoneNumber) => {
							// Actualizar todo en una sola operación para evitar múltiples re-renders
							if (fullPhoneNumber) {
								const parsed = parsePhoneNumber(fullPhoneNumber);
								setDetails(prevDetails => ({
									...prevDetails,
									prospectCountryCode: parsed.countryCode,
									prospectPhoneNumber: parsed.phoneNumber,
									prospectContactPhone: fullPhoneNumber
								}));
							} else {
								setDetails(prevDetails => ({
									...prevDetails,
									prospectCountryCode: "",
									prospectPhoneNumber: "",
									prospectContactPhone: ""
								}));
							}
						}}
						defaultCountry="CL"
					/>
					<Input
						label={<span>Cargo de contacto <span className="text-red-500">*</span></span>}
						value={details?.prospectContactRole}
						onChange={(e) => handleChange("prospectContactRole", e.target.value)}
					/>
				</div>

				<div className="flex gap-3 flex-col sm:flex-row">
					<SelectInput
						label={<span>Canal <span className="text-red-500">*</span></span>}
						value={details?.channel}
						options={channelOptions}
						onChange={(value) => handleChange("channel", value)}
						disabled={session?.accountType === "EXTERNAL"}
						className="w-full"
					/>
				</div>

				{activeForm?.fields && activeForm.fields.length > 0 && (
					<div className="space-y-4">
						<div className="border-t pt-4">
							<h3 className="text-lg font-semibold mb-4">Información adicional</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{activeForm.fields
									.sort((a, b) => a.order - b.order)
									.filter(field => field.label !== '¿Generar link de Google Meet?')
									.map((field) => {
										const fieldKey = field.id;
										
										return (
											<DynamicField
												key={field.id}
												field={field}
												value={dynamicFieldValues[fieldKey]}
												onChange={handleDynamicFieldChange}
												error={dynamicFieldErrors[fieldKey]}
												disabled={session?.accountType === "EXTERNAL"}
											/>
										);
									})}
							</div>
						</div>
					</div>
				)}

				<div className="border-t pt-4">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="generate_google_meet_link"
							checked={Boolean(dynamicFieldValues.generate_google_meet_link ?? true)}
							onCheckedChange={(checked) => handleDynamicFieldChange('generate_google_meet_link', checked)}
							disabled={session?.accountType === "EXTERNAL"}
						/>
						<label
							htmlFor="generate_google_meet_link"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							¿Generar link de Google Meet?
						</label>
					</div>

					<p className="text-xs text-gray-500 mt-1 ml-6">
						Desmarca esta casilla solo si el prospecto ya generó una cita con link de videollamada desde su correo.
					</p>
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
