export type NoteRecord = {
  id: string;
  title: string;
  bodyMarkdown: string;
  notebook: string;
  filePath: string;
  tags: string[];
  isPinned: boolean;
  isDaily: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VaultSnapshot = {
  vaultPath: string | null;
  notes: NoteRecord[];
  activeNoteId: string | null;
};

export type CreateNoteInput = {
  title?: string;
  notebook?: string;
};

export type SaveNoteInput = {
  id: string;
  title: string;
  bodyMarkdown: string;
  tags: string[];
};
