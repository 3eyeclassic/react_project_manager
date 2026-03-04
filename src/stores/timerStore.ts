import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimerState {
  projectId: string | null;
  projectName: string | null;
  startedAt: string | null; // ISO string
}

interface TimerActions {
  start: (projectId: string, projectName: string) => void;
  stop: () => void;
}

const initialState: TimerState = {
  projectId: null,
  projectName: null,
  startedAt: null,
};

export const useTimerStore = create<TimerState & TimerActions>()(
  persist(
    (set) => ({
      ...initialState,
      start: (projectId, projectName) =>
        set({
          projectId,
          projectName,
          startedAt: new Date().toISOString(),
        }),
      stop: () => set(initialState),
    }),
    { name: "timer" }
  )
);
