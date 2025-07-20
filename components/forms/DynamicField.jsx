"use client";

import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/SelectInput";
import { Checkbox } from "@/components/ui/checkbox";
export default function DynamicField({ field, value, onChange, error, disabled = false }) {
	// Usar directamente el ID del campo como clave estable
	const fieldKey = field.id;

	const handleChange = (newValue) => {
		onChange(fieldKey, newValue);
	};

	// Crear label con asterisco si es requerido
	const getFieldLabel = () => {
		if (field.required) {
			return (
				<span>
					{field.label} <span className="text-red-500">*</span>
				</span>
			);
		}
		return field.label;
	};

	const renderField = () => {
		switch (field.type) {
			case "STRING":
				return (
					<Input
						label={getFieldLabel()}
						value={value || ""}
						onChange={(e) => handleChange(e.target.value)}
						placeholder={field.placeholder}
						disabled={disabled}
						required={field.required}
						className={error ? "border-red-500" : ""}
					/>
				);

			case "NUMBER":
				return (
					<Input
						label={getFieldLabel()}
						type="number"
						value={value || ""}
						onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : "")}
						placeholder={field.placeholder}
						disabled={disabled}
						required={field.required}
						className={error ? "border-red-500" : ""}
					/>
				);

			case "BOOLEAN":
				return (
					<div className="space-y-2">
						<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<div className="flex items-center space-x-2">
							<Checkbox
								id={fieldKey}
								checked={Boolean(value)}
								onCheckedChange={handleChange}
								disabled={disabled}
								className={error ? "border-red-500" : ""}
							/>
							<label
								htmlFor={fieldKey}
								className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{field.placeholder || "Sí"}
							</label>
						</div>
					</div>
				);

			case "LIST":
				const options = (field.options || []).map((option) => ({
					value: option,
					name: option,
				}));

				return (
					<SelectInput
						label={getFieldLabel()}
						value={value || ""}
						options={options}
						onChange={handleChange}
						placeholder={field.placeholder || "Selecciona una opción"}
						disabled={disabled}
						required={field.required}
						className={error ? "border-red-500" : ""}
					/>
				);

			default:
				return (
					<div className="p-4 border border-red-200 rounded-md bg-red-50">
						<p className="text-red-600 text-sm">
							Tipo de campo no soportado: {field.type}
						</p>
					</div>
				);
		}
	};

	return (
		<div className="space-y-1">
			{renderField()}
			{field.helpText && (
				<p className="text-xs text-gray-500">{field.helpText}</p>
			)}
			{error && (
				<p className="text-xs text-red-500">{error}</p>
			)}
		</div>
	);
} 