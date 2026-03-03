import { create } from "zustand";

export interface KanbanFilters {
  search: string;
  clientId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export type CardDisplayField =
  | "name"
  | "clientName"
  | "timer"
  | "priority"
  | "progress"
  | "amount";

export interface CardDisplay {
  name: boolean;
  clientName: boolean;
  timer: boolean;
  priority: boolean;
  progress: boolean;
  amount: boolean;
}

interface KanbanState {
  filters: KanbanFilters;
  cardDisplay: CardDisplay;
  setSearch: (value: string) => void;
  setClientId: (value: string | null) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setCardDisplay: (field: CardDisplayField, value: boolean) => void;
  resetFilters: () => void;
  resetCardDisplay: () => void;
}

const defaultFilters: KanbanFilters = {
  search: "",
  clientId: null,
  startDate: null,
  endDate: null,
};

const defaultCardDisplay: CardDisplay = {
  name: true,
  clientName: true,
  timer: true,
  priority: false,
  progress: false,
  amount: false,
};

export const useKanbanStore = create<KanbanState>((set) => ({
  filters: defaultFilters,
  cardDisplay: defaultCardDisplay,
  setSearch: (value) =>
    set((s) => ({ filters: { ...s.filters, search: value } })),
  setClientId: (value) =>
    set((s) => ({ filters: { ...s.filters, clientId: value } })),
  setDateRange: (start, end) =>
    set((s) => ({
      filters: { ...s.filters, startDate: start, endDate: end },
    })),
  setCardDisplay: (field, value) =>
    set((s) => ({ cardDisplay: { ...s.cardDisplay, [field]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  resetCardDisplay: () => set({ cardDisplay: defaultCardDisplay }),
}));
