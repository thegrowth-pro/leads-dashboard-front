import React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import RPNInput, { getCountryCallingCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Componente principal PhoneInput
const PhoneInput = React.forwardRef(({ className, onChange, label = "Teléfono contacto", ...props }, ref) => {
	return (
		<div className="flex flex-col gap-1 h-9 mb-6">
			{label && (
				<div className="text-sm font-medium text-muted-foreground px-1">{label}</div>
			)}
			<RPNInput
				ref={ref}
				className={cn("flex items-center h-9", className)}
				flagComponent={FlagComponent}
				countrySelectComponent={CountrySelect}
				inputComponent={InputComponent}
				smartCaret={false}
				// Se asegura de pasar siempre una cadena, incluso cuando el valor es undefined
				onChange={(value) => onChange && onChange(value || "")}
				{...props}
			/>
		</div>
	);
});
PhoneInput.displayName = "PhoneInput";

// Input personalizado
const InputComponent = React.forwardRef(({ className, size = "md", ...props }, ref) => (
	<input
		className={cn(
			"w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
			size === "sm" ? "h-7 md:text-xs" : "h-9 md:text-sm",
			"rounded-l-none border-l-none",
			className
		)}
		ref={ref}
		{...props}
	/>
));
InputComponent.displayName = "InputComponent";

// Selector de país
const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }) => {
	return (
		<Popover modal>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					// Altura fija, sin borde derecho para que encaje con el input
					className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10 h-full"
					disabled={disabled}
				>
					<FlagComponent country={selectedCountry} countryName={selectedCountry} />
					<ChevronsUpDown className={cn("-mr-2 size-4 opacity-50", disabled ? "hidden" : "opacity-100")} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[270px] p-0">
				<Command>
					<CommandInput
						placeholder="Selecciona un país"
						className="h-9
					"
					/>
					<CommandList>
						<ScrollArea className="h-[200px]">
							<CommandEmpty>No country found.</CommandEmpty>
							<CommandGroup>
								{countryList.map(({ value, label }) =>
									value ? (
										<CountrySelectOption
											key={value}
											country={value}
											countryName={label}
											selectedCountry={selectedCountry}
											onChange={onChange}
										/>
									) : null
								)}
							</CommandGroup>
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

// Opción para cada país en el selector
const CountrySelectOption = ({ country, countryName, selectedCountry, onChange }) => {
	return (
		<CommandItem className="gap-2" onSelect={() => onChange(country)}>
			<FlagComponent country={country} countryName={countryName} />
			<span className="flex-1 text-sm">{countryName}</span>
			<span className="text-sm text-foreground/50">{`+${getCountryCallingCode(country)}`}</span>
			<CheckIcon className={`ml-auto h-4 w-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`} />
		</CommandItem>
	);
};

// Componente para mostrar la bandera del país
const FlagComponent = ({ country, countryName }) => {
	const Flag = flags[country];
	return (
		<span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:h-full [&_svg]:w-full">
			{Flag && <Flag title={countryName} />}
		</span>
	);
};

export { PhoneInput };
