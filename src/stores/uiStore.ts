import { create } from "zustand";

type NoteFilter = "all" | "pinned" | "tagged";

type UiState = {
  theme: "light" | "dark";
  compactMode: boolean;
  showContextPanel: boolean;
  noteFilter: NoteFilter;
  query: string;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  toggleCompactMode: () => void;
  toggleContextPanel: () => void;
  setNoteFilter: (filter: NoteFilter) => void;
  setQuery: (query: string) => void;
};

const STORAGE_KEY = "trace.ui-preferences";

function readInitialState() {
  if (typeof window === "undefined") {
    return {
      theme: "light" as const,
      compactMode: false,
      showContextPanel: true,
    };
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return {
      theme: "light" as const,
      compactMode: false,
      showContextPanel: true,
    };
  }

  const parsed = JSON.parse(rawValue) as {
    theme?: "light" | "dark";
    compactMode?: boolean;
    showContextPanel?: boolean;
  };

  return {
    theme: parsed.theme ?? "light",
    compactMode: parsed.compactMode ?? false,
    showContextPanel: parsed.showContextPanel ?? true,
  };
}

function persist(state: {
  theme: "light" | "dark";
  compactMode: boolean;
  showContextPanel: boolean;
}) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

const initialState = readInitialState();

export const useUiStore = create<UiState>((set, get) => ({
  ...initialState,
  noteFilter: "all",
  query: "",
  setTheme(theme) {
    set({ theme });
    persist({
      ...get(),
      theme,
    });
  },
  toggleTheme() {
    const theme = get().theme === "light" ? "dark" : "light";
    set({ theme });
    persist({
      ...get(),
      theme,
    });
  },
  toggleCompactMode() {
    const compactMode = !get().compactMode;
    set({ compactMode });
    persist({
      ...get(),
      compactMode,
    });
  },
  toggleContextPanel() {
    const showContextPanel = !get().showContextPanel;
    set({ showContextPanel });
    persist({
      ...get(),
      showContextPanel,
    });
  },
  setNoteFilter(noteFilter) {
    set({ noteFilter });
  },
  setQuery(query) {
    set({ query });
  },
}));
