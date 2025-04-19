import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFilterStore = create(
	persist(
		(set) => ({
			searchTerm: "",
			startDate: null,
			endDate: null,
			selectedDateFilter: null,
			selectedFilters: {},
			selectedClient: null,
			selectedPod: null,
			lastPath: "", // Mantenemos el estado inicial como string vacío
			_hasHydrated: false, // Estado para tracking de hidratación

			setHasHydrated: (state) => set({ _hasHydrated: state }),

			setSearchTerm: (term) => set({ searchTerm: term || "" }),

			updateFilter: (filterGroup, optionValue, isChecked, oneOnly) => {
				set((state) => {
					const updatedFilters = { ...(state?.selectedFilters || {}) };

					// Si el filtro no existe en el estado actual, inicializarlo
					if (!updatedFilters[filterGroup]) {
						updatedFilters[filterGroup] = [];
					}

					if (isChecked) {
						if (oneOnly) {
							// Si solo se permite una selección, reemplazar el array completo
							updatedFilters[filterGroup] = [optionValue];
						} else {
							// Agregar la nueva opción si no está ya incluida
							if (!updatedFilters[filterGroup].includes(optionValue)) {
								updatedFilters[filterGroup] = [...updatedFilters[filterGroup], optionValue];
							}
						}
					} else {
						// Remover la opción si se desmarca
						updatedFilters[filterGroup] = updatedFilters[filterGroup].filter(
							(value) => value !== optionValue
						);

						// Eliminar el grupo si no tiene más opciones seleccionadas
						if (updatedFilters[filterGroup].length === 0) {
							delete updatedFilters[filterGroup];
						}
					}

					return { selectedFilters: updatedFilters || {} };
				});
			},

			updateSelectedClient: (client) => {
				set({ selectedClient: client });
			},

			updateSelectedPod: (pod) => {
				set({ selectedPod: pod });
			},

			updateStartDate: (date) => set({ startDate: date }),
			updateEndDate: (date) => set({ endDate: date }),
			updateSelectedDateFilter: (filter) => set({ selectedDateFilter: filter }),
			setLastPath: (path) => set({ lastPath: path }), // Agregamos el setter para lastPath

			resetFilters: () =>
				set({
					selectedFilters: {},
					searchTerm: "",
					startDate: null,
					endDate: null,
					selectedDateFilter: "",
					selectedClient: null,
					selectedPod: null,
				}),
		}),
		{
			name: "data-grid-storage",
			onRehydrateStorage: () => (state) => {
				state.setHasHydrated(true);
			},
		}
	)
);

export default useFilterStore;
