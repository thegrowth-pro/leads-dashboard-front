import React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import RPNInput, { 
	getCountryCallingCode, 
	getCountries, 
	formatPhoneNumber as formatPhoneNumberRPN,
	parsePhoneNumber as parsePhoneNumberRPN 
} from "react-phone-number-input";
import { AsYouType } from "libphonenumber-js";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es.json";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";


const PhoneInput = React.forwardRef(({ 
	className, 
	onChange, 
	value,
	countryCode,
	phoneNumber,
	onCountryChange,
	onPhoneChange,
	defaultCountry = "CL",
	countryLabel = "País",
	phoneLabel = "Teléfono",
	...props 
}, ref) => {
	const [selectedCountry, setSelectedCountry] = React.useState(defaultCountry);
	const [phoneValue, setPhoneValue] = React.useState("");
	const [isInitialized, setIsInitialized] = React.useState(false);
	
	React.useEffect(() => {
		if (value && !isInitialized) {
			const parsed = parsePhoneNumberRPN(value);
			if (parsed && parsed.country) {
				setSelectedCountry(parsed.country);
			}
			setPhoneValue(formatPhoneNumberRPN(value) || "");
			setIsInitialized(true);
		} else if (!value && !isInitialized) {
			setIsInitialized(true);
		}
	}, [value, isInitialized]);
	
	const handleCountryChange = (newCountry) => {
		setSelectedCountry(newCountry);
		
		const digits = phoneValue.replace(/\D/g, '');
		if (digits) {
			const formatter = new AsYouType(newCountry);
			const reformattedValue = formatter.input(digits);
			setPhoneValue(reformattedValue);
		}
		
		const fullPhone = digits ? `+${getCountryCallingCode(newCountry)}${digits}` : "";
		if (onChange) onChange(fullPhone);
	};
	
	const handlePhoneChange = (e) => {
		const inputValue = e.target.value;
		
		const formatter = new AsYouType(selectedCountry);
		const formattedValue = formatter.input(inputValue);
		
		setPhoneValue(formattedValue);
		
		const digits = inputValue.replace(/\D/g, '');
		const fullPhone = digits ? `+${getCountryCallingCode(selectedCountry)}${digits}` : "";
		if (onChange) onChange(fullPhone);
	};
	
	return (
		<div className="flex flex-col gap-1 mb-6">
			<div className="flex items-end gap-2">
				<div className="flex flex-col gap-1">
					<div className="text-sm font-medium text-muted-foreground px-1">{countryLabel}</div>
					<CountrySelectSimple 
						value={selectedCountry}
						onChange={handleCountryChange}
					/>
				</div>
				<div className="flex flex-col gap-1 flex-1">
					<div className="text-sm font-medium text-muted-foreground px-1">{phoneLabel}</div>
					<input
						ref={ref}
						type="tel"
						value={phoneValue}
						onChange={handlePhoneChange}
						className={cn(
							"w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
							"placeholder:text-muted-foreground placeholder:text-sm",
							"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
							"disabled:cursor-not-allowed disabled:opacity-50",
							className
						)}
						placeholder="Número de teléfono"
						{...props}
					/>
				</div>
			</div>
		</div>
	);
});
PhoneInput.displayName = "PhoneInput";

const CountrySelectSimple = ({ value: selectedCountry, onChange }) => {
	
	const allCountries = getCountries();
	const priorityCountries = ["CL", "AR", "PE", "CO", "MX", "ES", "US", "BR"];
	const organizedCountries = [
		...priorityCountries.filter(country => allCountries.includes(country)),
		...allCountries.filter(country => !priorityCountries.includes(country))
	];
	
	const countryCode = selectedCountry ? getCountryCallingCode(selectedCountry) : "";
	
	return (
		<Popover modal>
			<PopoverTrigger asChild>
				<div className="relative w-28">
					<input
						type="text"
						readOnly
						value={countryCode ? `+${countryCode}` : ""}
						className={cn(
							"w-full h-9 rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors cursor-pointer",
							"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
							"pl-10 pr-10 text-center"
						)}
						placeholder="+XX"
					/>
					<div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
						<FlagComponent country={selectedCountry} countryName={selectedCountry} />
					</div>
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
						<ChevronsUpDown className="size-3 opacity-50" />
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-[270px] p-0">
				<Command>
					<CommandInput
						placeholder="Selecciona un país"
						className="h-9"
					/>
					<CommandList>
						<ScrollArea className="h-[200px]">
							<CommandEmpty>No se encontró el país.</CommandEmpty>
							<CommandGroup>
								{organizedCountries.map((country) => (
									<CommandItem 
										key={country} 
										className="gap-2" 
										onSelect={() => onChange(country)}
									>
										<FlagComponent country={country} countryName={es[country] || country} />
										<span className="flex-1 text-sm">{es[country] || country}</span>
										<span className="text-sm text-foreground/50">
											+{getCountryCallingCode(country)}
										</span>
										<CheckIcon className={`ml-auto h-4 w-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`} />
									</CommandItem>
								))}
							</CommandGroup>
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

const FlagComponent = ({ country, countryName }) => {
	const Flag = flags[country];
	return (
		<span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:h-full [&_svg]:w-full">
			{Flag && <Flag title={countryName} />}
		</span>
	);
};

const parsePhoneNumber = (fullPhoneNumber) => {
	if (!fullPhoneNumber) return { countryCode: "CL", phoneNumber: "" };
	
	const parsed = parsePhoneNumberRPN(fullPhoneNumber);
	if (parsed) {
		return {
			countryCode: parsed.country || "CL",
			phoneNumber: parsed.nationalNumber || ""
		};
	}
	return { countryCode: "CL", phoneNumber: fullPhoneNumber.replace(/^\+/, "") };
};

const combinePhoneNumber = (countryCode, phoneNumber) => {
	if (!countryCode || !phoneNumber) return "";
	return `+${getCountryCallingCode(countryCode)}${phoneNumber}`;
};

export { PhoneInput, combinePhoneNumber, parsePhoneNumber };
