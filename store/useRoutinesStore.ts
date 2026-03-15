import { create } from 'zustand';
import { getRoutines } from '../services/api';
import type { RoutineRow } from '../types';

interface RoutinesStore {
  routines: RoutineRow[];
  loading: boolean;
  error: string | null;
  /** Carga las rutinas desde la API y las cachea en el store. */
  fetch: (token: string) => Promise<void>;
  /** Invalida el cache para forzar un re-fetch en el próximo foco. */
  invalidate: () => void;
}

export const useRoutinesStore = create<RoutinesStore>((set) => ({
  routines: [],
  loading: false,
  error: null,

  fetch: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getRoutines(token);
      set({ routines: data, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar rutinas',
      });
    }
  },

  invalidate: () => set({ routines: [] }),
}));
