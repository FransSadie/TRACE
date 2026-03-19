import type { CreateNoteInput, SaveNoteInput, VaultSnapshot } from "../types/note";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

const BROWSER_STORAGE_KEY = "trace.browser-snapshot";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function readBrowserSnapshot(): VaultSnapshot {
  if (typeof window === "undefined") {
    return {
      vaultPath: null,
      notes: [],
      activeNoteId: null,
    };
  }

  const rawValue = window.localStorage.getItem(BROWSER_STORAGE_KEY);
  if (rawValue) {
    return JSON.parse(rawValue) as VaultSnapshot;
  }

  const now = new Date().toISOString();
  const initialSnapshot: VaultSnapshot = {
    vaultPath: "Browser Demo Vault",
    activeNoteId: "welcome-note",
    notes: [
      {
        id: "welcome-note",
        title: "Welcome note",
        bodyMarkdown:
          "# Welcome note\n\nThis browser-safe fallback lets us shape the interface before the full desktop workflows are finished.\n\n- Toggle dark mode\n- Filter notes quickly\n- Type and let autosave keep up\n- Move into the desktop shell when you want filesystem access",
        notebook: "Inbox",
        filePath: "Inbox/welcome-note.md",
        tags: ["welcome", "browser", "demo"],
        isPinned: true,
        isDaily: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };

  window.localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(initialSnapshot));
  return initialSnapshot;
}

function writeBrowserSnapshot(snapshot: VaultSnapshot) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(snapshot));
  }
}

function createBrowserNote(input: CreateNoteInput, snapshot: VaultSnapshot): VaultSnapshot {
  const now = new Date().toISOString();
  const title = input.title?.trim() || "Untitled Note";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `note-${Date.now()}`;

  const note = {
    id,
    title,
    bodyMarkdown: `# ${title}\n`,
    notebook: input.notebook ?? "Inbox",
    filePath: `${input.notebook ?? "Inbox"}/${slug || "untitled-note"}.md`,
    tags: [],
    isPinned: false,
    isDaily: false,
    createdAt: now,
    updatedAt: now,
  };

  return {
    vaultPath: snapshot.vaultPath ?? "Browser Demo Vault",
    notes: [note, ...snapshot.notes],
    activeNoteId: note.id,
  };
}

function saveBrowserNote(input: SaveNoteInput, snapshot: VaultSnapshot): VaultSnapshot {
  const now = new Date().toISOString();
  const notes = snapshot.notes.map((note) =>
    note.id === input.id
      ? {
          ...note,
          title: input.title.trim() || "Untitled Note",
          bodyMarkdown: input.bodyMarkdown,
          tags: input.tags,
          updatedAt: now,
        }
      : note,
  );

  return {
    ...snapshot,
    notes,
    activeNoteId: input.id,
  };
}

export async function chooseVaultFolder(): Promise<string | null> {
  if (!isTauriRuntime()) {
    return "Browser Demo Vault";
  }

  const result = await open({
    directory: true,
    multiple: false,
    title: "Choose a vault folder",
  });

  if (typeof result !== "string") {
    return null;
  }

  return result;
}

export async function bootstrapVault(vaultPath: string): Promise<VaultSnapshot> {
  if (!isTauriRuntime()) {
    const snapshot = {
      ...readBrowserSnapshot(),
      vaultPath,
    };
    writeBrowserSnapshot(snapshot);
    return snapshot;
  }

  return invoke<VaultSnapshot>("bootstrap_vault", { vaultPath });
}

export async function loadSnapshot(): Promise<VaultSnapshot> {
  if (!isTauriRuntime()) {
    return readBrowserSnapshot();
  }

  return invoke<VaultSnapshot>("load_snapshot");
}

export async function createNote(input: CreateNoteInput) {
  if (!isTauriRuntime()) {
    const nextSnapshot = createBrowserNote(input, readBrowserSnapshot());
    writeBrowserSnapshot(nextSnapshot);
    return nextSnapshot;
  }

  return invoke<VaultSnapshot>("create_note", { input });
}

export async function saveNote(input: SaveNoteInput) {
  if (!isTauriRuntime()) {
    const nextSnapshot = saveBrowserNote(input, readBrowserSnapshot());
    writeBrowserSnapshot(nextSnapshot);
    return nextSnapshot;
  }

  return invoke<VaultSnapshot>("save_note", { input });
}
