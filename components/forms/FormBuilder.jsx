"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/ui/SelectInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, X } from "lucide-react";
import { fetchFormPresets } from "@/app/actions/forms";
import { useToast } from "@/hooks/use-toast";

const fieldTypes = [
	{ value: "STRING", name: "Texto" },
	{ value: "NUMBER", name: "Número" },
	{ value: "BOOLEAN", name: "Checkbox" },
	{ value: "LIST", name: "Lista desplegable" },
];

// Componente para editar opciones de lista
function OptionsEditor({ options, onChange, disabled }) {
	const [newOption, setNewOption] = useState("");

	const addOption = () => {
		if (newOption.trim() && !options.includes(newOption.trim())) {
			onChange([...options, newOption.trim()]);
			setNewOption("");
		}
	};

	const removeOption = (index) => {
		const newOptions = options.filter((_, i) => i !== index);
		onChange(newOptions);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addOption();
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				<Input
					value={newOption}
					onChange={(e) => setNewOption(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Agregar nueva opción"
					disabled={disabled}
					className="flex-1"
				/>
				<Button
					type="button"
					onClick={addOption}
					disabled={disabled || !newOption.trim() || options.includes(newOption.trim())}
					size="sm"
				>
					<Plus className="w-4 h-4" />
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{options.map((option, index) => (
					<Badge
						key={index}
						variant="secondary"
						className="flex items-center gap-1 py-1 px-2"
					>
						<span>{option}</span>
						{!disabled && (
							<button
								type="button"
								onClick={() => removeOption(index)}
								className="ml-1 text-gray-500 hover:text-red-500"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</Badge>
				))}
			</div>
			{options.length === 0 && (
				<p className="text-sm text-gray-500 italic">No hay opciones configuradas</p>
			)}
		</div>
	);
}

export default function FormBuilder({ form, onFormChange, disabled = false, isRestricted = false }) {
	const { toast } = useToast();
	const [fields, setFields] = useState(form?.fields || []);
	const [presets, setPresets] = useState([]);
	const [showPresets, setShowPresets] = useState(false);

	useEffect(() => {
		setFields(form?.fields || []);
	}, [form]);

	useEffect(() => {
		const fetchPresets = async () => {
			const { data, error } = await fetchFormPresets();
			if (!error) {
				setPresets(data);
			}
		};
		fetchPresets();
	}, []);



	const updateForm = (newFields) => {
		setFields(newFields);
		onFormChange({
			...form,
			fields: newFields.map((field, index) => ({
				...field,
				order: index,
			})),
		});
	};

	const addField = (fieldData = null) => {
		const newField = fieldData || {
			label: "Nuevo campo",
			type: "STRING",
			required: false,
			order: fields.length,
			options: [],
			placeholder: "",
			helpText: "",
		};
		
		updateForm([...fields, newField]);
	};

	const updateField = (index, updates) => {
		const newFields = [...fields];
		newFields[index] = { ...newFields[index], ...updates };
		updateForm(newFields);
	};

	const updateFieldLabel = (index, label) => {
		updateField(index, { label: label });
	};

	const removeField = (index) => {
		const newFields = fields.filter((_, i) => i !== index);
		updateForm(newFields);
	};

	const moveField = (index, direction) => {
		const newFields = [...fields];
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		
		if (targetIndex >= 0 && targetIndex < newFields.length) {
			[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
			updateForm(newFields);
		}
	};

	const duplicateField = (index) => {
		const fieldToDuplicate = fields[index];
		const duplicatedField = {
			...fieldToDuplicate,
			label: `${fieldToDuplicate.label} (Copia)`,
		};
		const newFields = [...fields];
		newFields.splice(index + 1, 0, duplicatedField);
		updateForm(newFields);
	};

	const addFromPreset = (preset) => {
		const presetField = {
			...preset,
			order: fields.length,
		};
		addField(presetField);
		setShowPresets(false);
		toast({
			title: "Campo agregado",
			description: `El campo "${preset.label}" se agregó al formulario`,
			variant: "success",
		});
	};



	return (
		<div className="space-y-4">
			{/* Header con acciones */}
			<div className="flex justify-between items-center">
				<div className="flex flex-col">
					<h3 className="text-lg font-semibold">Configuración de campos</h3>
				</div>
				{!isRestricted && (
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowPresets(!showPresets)}
							disabled={disabled}
						>
							<Plus className="w-4 h-4 mr-2" />
							Usar preset
						</Button>

						<Button
							type="button"
							onClick={() => addField()}
							disabled={disabled}
						>
							<Plus className="w-4 h-4 mr-2" />
							Agregar campo
						</Button>
					</div>
				)}
			</div>

			{/* Presets */}
			{showPresets && !isRestricted && (
				<div className="border border-gray-200 rounded-lg bg-white shadow-sm">
					<div className="p-4 border-b border-gray-200">
						<h4 className="text-base font-semibold">Campos predefinidos</h4>
					</div>
					<div className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{presets.map((preset) => (
								<Button
									key={preset.key}
									variant="outline"
									className="justify-start h-auto p-3"
									onClick={() => addFromPreset(preset)}
									disabled={disabled}
								>
									<div className="text-left">
										<div className="font-medium">{preset.label}</div>
										<div className="text-xs text-gray-500 mt-1">
											<Badge variant="secondary" className="text-xs">
												{fieldTypes.find(t => t.value === preset.type)?.name}
											</Badge>
										</div>
									</div>
								</Button>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="space-y-3">
				{fields.map((field, index) => (
					<div key={`field-${index}`} className={`relative border rounded-lg shadow-sm border-gray-200 bg-white`}>
						<div className="p-4">
							<div className="grid grid-cols-12 gap-4 items-start">
								{!isRestricted && (
									<div className="col-span-1 flex flex-col gap-1">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => moveField(index, "up")}
											disabled={disabled || index === 0}
										>
											<ArrowUp className="w-3 h-3" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => moveField(index, "down")}
											disabled={disabled || index === fields.length - 1}
										>
											<ArrowDown className="w-3 h-3" />
										</Button>
									</div>
								)}

								<div className={`space-y-3 ${isRestricted ? 'col-span-12' : 'col-span-10'}`}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<Input
											label="Etiqueta"
											value={field.label}
											onChange={(e) => updateFieldLabel(index, e.target.value)}
											disabled={disabled}
											placeholder="Ej: Industria de la empresa"
										/>
										{!isRestricted ? (
											<div className="flex items-center space-x-2 pt-6">
												<Checkbox
													id={`required-${index}`}
													checked={field.required}
													onCheckedChange={(checked) => updateField(index, { required: checked })}
													disabled={disabled}
												/>
												<label htmlFor={`required-${index}`} className="text-sm font-medium">
													Campo obligatorio
												</label>
											</div>
										) : (
											<div className="flex items-center space-x-2 pt-6">
												<Checkbox
													id={`required-${index}`}
													checked={field.required}
													disabled={true}
												/>
												<label htmlFor={`required-${index}`} className="text-sm font-medium text-gray-500">
													Campo obligatorio (no editable)
												</label>
											</div>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<SelectInput
											label="Tipo de campo"
											value={field.type}
											options={fieldTypes}
											onChange={(value) => updateField(index, { type: value })}
											disabled={disabled || isRestricted}
										/>
										{isRestricted && (
											<div className="pt-6">
												<p className="text-xs text-gray-500 italic">
													El tipo de campo no se puede modificar
												</p>
											</div>
										)}
									</div>

									{field.type === "LIST" && (
										<div>
											<label className="text-sm font-medium mb-2 block">
												Opciones {isRestricted && <span className="text-gray-500">(no editables)</span>}
											</label>
											<OptionsEditor
												options={field.options || []}
												onChange={(options) => updateField(index, { options })}
												disabled={disabled || isRestricted}
											/>
										</div>
									)}

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<Input
											label="Placeholder"
											value={field.placeholder || ''}
											onChange={(e) => updateField(index, { placeholder: e.target.value })}
											disabled={disabled}
											placeholder="Texto de ayuda"
										/>
										<Input
											label="Texto de ayuda"
											value={field.helpText || ''}
											onChange={(e) => updateField(index, { helpText: e.target.value })}
											disabled={disabled}
											placeholder="Información adicional para el usuario"
										/>
									</div>
								</div>

								{/* Acciones */}
								{!isRestricted && (
									<div className="col-span-1 flex flex-col gap-1">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => duplicateField(index)}
											disabled={disabled}
										>
											<Copy className="w-3 h-3" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeField(index)}
											disabled={disabled}
										>
											<Trash2 className="w-3 h-3 text-red-500" />
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{fields.length === 0 && (
				<div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
					<div className="flex flex-col items-center justify-center py-8">
						<p className="text-gray-500 mb-4">
							{isRestricted 
								? "Este formulario no tiene campos configurados y no se pueden agregar nuevos campos porque tiene respuestas asociadas"
								: "No hay campos configurados"
							}
						</p>
						{!isRestricted && (
							<Button
								type="button"
								onClick={() => addField()}
								disabled={disabled}
							>
								<Plus className="w-4 h-4 mr-2" />
								Agregar primer campo
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
} 