"use client";

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function SelectInput({
	label = "Label",
	placeholder = "Selecciona una opción",
	value = "",
	options = [],
	onChange,
	className = "",
	labelClassName = "",
	selectProps = {},
	disabled = false,
	isLoading = false,
}) {
	return (
		<div className={cn("flex flex-col", className)}>
			<div className={`text-sm font-medium text-muted-foreground px-1 ${labelClassName}`}>{label}</div>
			<Select value={value} onValueChange={onChange} {...selectProps} disabled={disabled}>
				<SelectTrigger
					isLoading={isLoading}
					className={cn(value === "" || !value ? "text-gray-500" : "text-foreground")}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options?.length > 0 ? (
							options.map((option, idx) => (
								<SelectItem key={idx} value={option.id || option.value}>
									{option.name}
								</SelectItem>
							))
						) : (
							<SelectLabel>No hay opciones disponibles</SelectLabel>
						)}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
