"use client";

import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

const defaultStyles = {
	container: "flex flex-col gap-1 w-full",
	label: "text-sm font-medium text-muted-foreground px-1",
	button: "w-full justify-between h-9 rounded-md font-normal border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
	buttonLoading: "cursor-wait",
	buttonPlaceholder: "text-gray-500",
	buttonSelected: "text-foreground",
	popoverContent: "w-[--radix-popover-trigger-width] p-0 z-[999]",
};

const Combobox = ({
	label,
	placeholder = "Seleccionar...",
	items = [],
	value,
	onChange,
	disabled = false,
	isLoading = false,
	className = "",
	labelClassName = "",
	searchPlaceholder = "Buscar...",
	noResultsText = "No se encontraron resultados.",
	...props
}) => {
	const [open, setOpen] = useState(false);

	const handleSelect = (itemId) => {
		onChange(value === itemId ? "" : itemId);
		setOpen(false);
	};

	const selectedItem = items.find((item) => item.id === value);
	const displayValue = selectedItem?.name || placeholder;

	return (
		<div className={cn(defaultStyles.container, className)}>
			{label && (
				<label className={cn(defaultStyles.label, labelClassName)} htmlFor="combobox-trigger">
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild className="w-full">
					<Button
						id="combobox-trigger"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-controls="combobox-list"
						aria-label={label || "Combobox"}
						disabled={disabled}
						className={cn(
							defaultStyles.button,
							isLoading && defaultStyles.buttonLoading,
							!value && defaultStyles.buttonPlaceholder,
							value && defaultStyles.buttonSelected
						)}
						{...props}
					>
						<span className="truncate">{displayValue}</span>
						{isLoading ? (
							<LoaderCircle className="h-4 w-4 animate-spin" />
						) : (
							<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className={defaultStyles.popoverContent} align="start">
					<Command className="w-full">
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList id="combobox-list">
							<CommandEmpty>{noResultsText}</CommandEmpty>
							<CommandGroup>
								{items.map((item) => (
									<CommandItem
										key={item.id}
										value={item.name}
										onSelect={() => handleSelect(item.id)}
										aria-selected={value === item.id}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === item.id ? "opacity-100" : "opacity-0"
											)}
										/>
										{item.name}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default Combobox;
