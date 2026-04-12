import { create } from "zustand";
import { persist } from "zustand/middleware";

type Chunk = {
  id: number;
  text: string;
};

type TeachingSession = {
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  chunks: Chunk[];
  currentChunkIndex: number;
  questions: string[];
};

type TeachingStore = {
  sessions: TeachingSession[];
  activeSessionIndex: number | null;

  addSession: (session: TeachingSession) => void;
  setActiveSession: (index: number) => void;
  updateChunkIndex: (index: number) => void;
  addQuestion: (question: string) => void;
  clearTeachingStore: () => void;
};

export const useTeachingStore = create<TeachingStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionIndex: null,

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      setActiveSession: (index) =>
        set({
          activeSessionIndex: index,
        }),

      updateChunkIndex: (index) =>
        set((state) => {
          const i = state.activeSessionIndex;
          if (i === null) return state;

          const sessions = [...state.sessions];
          sessions[i] = {
            ...sessions[i],
            currentChunkIndex: index,
          };

          return { sessions };
        }),

      addQuestion: (question) =>
        set((state) => {
          const i = state.activeSessionIndex;
          if (i === null) return state;

          const sessions = [...state.sessions];
          sessions[i] = {
            ...sessions[i],
            questions: [...sessions[i].questions, question],
          };

          return { sessions };
        }),

      clearTeachingStore: () =>
        set({
          sessions: [],
          activeSessionIndex: null,
        }),
    }),
    {
      name: "teaching-store", // localStorage key
    }
  )
);
