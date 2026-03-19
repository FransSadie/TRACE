import { create } from "zustand";
import type {
  CreateNoteInput,
  NoteRecord,
  SaveNoteInput,
  VaultSnapshot,
} from "../types/note";
import {
  bootstrapVault,
  chooseVaultFolder,
  createNote as createNoteCommand,
  loadSnapshot,
  saveNote as saveNoteCommand,
} from "../lib/tauri";

type WorkspaceState = {
  vaultPath: string | null;
  notes: NoteRecord[];
  activeNoteId: string | null;
  isBooting: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  selectVault: () => Promise<void>;
  setActiveNote: (noteId: string) => void;
  clearError: () => void;
  createNote: (input?: CreateNoteInput) => Promise<void>;
  saveActiveNote: (input: Omit<SaveNoteInput, "id">) => Promise<void>;
};

function applySnapshot(
  set: (partial: Partial<WorkspaceState>) => void,
  snapshot: VaultSnapshot,
) {
  set({
    vaultPath: snapshot.vaultPath,
    notes: snapshot.notes,
    activeNoteId: snapshot.activeNoteId,
    error: null,
  });
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  vaultPath: null,
  notes: [],
  activeNoteId: null,
  isBooting: false,
  isSaving: false,
  error: null,
  async initialize() {
    set({ isBooting: true, error: null });

    try {
      const snapshot = await loadSnapshot();
      applySnapshot(set, snapshot);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load workspace",
      });
    } finally {
      set({ isBooting: false });
    }
  },
  async selectVault() {
    const vaultPath = await chooseVaultFolder();
    if (!vaultPath) {
      return;
    }

    set({ isBooting: true, error: null });

    try {
      const snapshot = await bootstrapVault(vaultPath);
      applySnapshot(set, snapshot);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to initialize vault",
      });
    } finally {
      set({ isBooting: false });
    }
  },
  setActiveNote(noteId) {
    set({ activeNoteId: noteId });
  },
  clearError() {
    set({ error: null });
  },
  async createNote(input = {}) {
    set({ isBooting: true, error: null });

    try {
      const snapshot = await createNoteCommand(input);
      applySnapshot(set, snapshot);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create note",
      });
    } finally {
      set({ isBooting: false });
    }
  },
  async saveActiveNote(input) {
    const activeNoteId = get().activeNoteId;
    if (!activeNoteId) {
      return;
    }

    set({ isSaving: true, error: null });

    try {
      const snapshot = await saveNoteCommand({
        id: activeNoteId,
        ...input,
      });
      applySnapshot(set, snapshot);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to save note",
      });
    } finally {
      set({ isSaving: false });
    }
  },
}));
