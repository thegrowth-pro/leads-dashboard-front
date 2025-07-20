"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useOnClickOutside } from "@/hooks/use-click-outside";

const MultiSelect = ({
	label = "Label",
	placeholder = "Selecciona opciones",
	options = [],
	selected = [],
	onChange,
	className = "",
	labelClassName = "",
	disabled = false,
	isLoading = false,
	...props
}) => {
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef(null);
	const commandRef = React.useRef(null);

	// Manejar clic fuera del componente para cerrar el dropdown
	useOnClickOutside(ref, () => setOpen(false));

	const handleUnselect = (itemId) => {
		if (disabled) return;
		onChange(selected.filter((id) => id !== itemId));
	};

	const handleSelect = (itemId) => {
		if (disabled) return;

		if (selected.includes(itemId)) {
			onChange(selected.filter((id) => id !== itemId));
		} else {
			onChange([...selected, itemId]);
		}
	};

	return (
		<div className={cn("flex flex-col relative hover:bg-none gap-1", className)} ref={ref}>
			<div className={`text-sm font-medium text-muted-foreground px-1 ${labelClassName}`}>{label}</div>
			<Button
				type="button"
				variant="outline"
				role="combobox"
				aria-expanded={open}
				disabled={disabled || isLoading}
				className={cn("w-full justify-between hover:bg-", selected.length > 0 ? "h-auto min-h-9" : "h-9")}
				onClick={() => setOpen(!open)}
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<>
						<div className="flex flex-wrap gap-1">
							{selected.length === 0 ? (
								<span className="text-gray-500 font-normal">{placeholder}</span>
							) : (
								selected.map((itemId) => (
									<Badge
										variant="secondary"
										key={itemId}
										className="mr-1 mb-1"
										onClick={(e) => {
											if (!disabled) {
												e.stopPropagation();
												handleUnselect(itemId);
											}
										}}
									>
										{options.find((option) => option.id === itemId)?.name || itemId}
										{!disabled && (
											<div
												className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleUnselect(itemId);
													}
												}}
												onMouseDown={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onClick={(e) => {
													e.stopPropagation();
													handleUnselect(itemId);
												}}
											>
												<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
											</div>
										)}
									</Badge>
								))
							)}
						</div>
						<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
					</>
				)}
			</Button>

			{open && (
				<div
					className="absolute top-full left-0 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden"
					ref={commandRef}
				>
					<Command className="w-full">
						<CommandList>
							<CommandEmpty>No hay opciones disponibles</CommandEmpty>
							<CommandGroup className="max-h-64 overflow-auto">
								{options.map((option) => (
									<CommandItem
										key={option.id}
										value={option.id}
										onSelect={() => handleSelect(option.id)}
										className="cursor-pointer hover:bg-accent flex items-center"
									>
										<div className="flex items-center gap-2 w-full">
											<Check
												className={cn(
													"h-4 w-4 text-primary",
													selected.includes(option.id) ? "opacity-100" : "opacity-0"
												)}
											/>
											<span>{option.name}</span>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</div>
			)}
		</div>
	);
};

export { MultiSelect };
