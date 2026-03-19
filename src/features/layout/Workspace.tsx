import { useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Sun,
  Type,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { useUiStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { NoteEditor } from "../notes/NoteEditor";
import { NoteList } from "../notes/NoteList";

export function Workspace() {
  const {
    activeNoteId,
    clearError,
    createNote,
    error,
    isBooting,
    isSaving,
    notes,
    saveActiveNote,
    selectVault,
    setActiveNote,
    vaultPath,
  } = useWorkspaceStore();
  const {
    compactMode,
    noteFilter,
    query,
    setNoteFilter,
    setQuery,
    showContextPanel,
    theme,
    toggleCompactMode,
    toggleContextPanel,
    toggleTheme,
  } = useUiStore();

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [activeNoteId, notes],
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notes.filter((note) => {
      if (noteFilter === "pinned" && !note.isPinned) return false;
      if (noteFilter === "tagged" && note.tags.length === 0) return false;
      if (!normalizedQuery) return true;

      return [note.title, note.bodyMarkdown, note.notebook, note.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [noteFilter, notes, query]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        void createNote({});
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("trace-note-search")?.focus();
      }

      if (event.key === "Escape") {
        clearError();
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [clearError, createNote]);

  const pinnedCount = notes.filter((note) => note.isPinned).length;
  const taggedCount = notes.filter((note) => note.tags.length > 0).length;

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Notes workspace</h1>
            <p className="text-sm text-muted-foreground">
              A local-first writing surface for notes, drafts, links, and daily work.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void createNote({})} type="button">
              <Plus className="h-4 w-4" />
              New note
            </Button>
            <Button onClick={() => void selectVault()} type="button" variant="outline">
              Choose vault
            </Button>
            <Button onClick={() => toggleCompactMode()} type="button" variant="outline">
              <Type className="h-4 w-4" />
              {compactMode ? "Comfortable" : "Compact"}
            </Button>
            <Button onClick={() => toggleTheme()} type="button" variant="outline">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
            <Button onClick={() => toggleContextPanel()} type="button" variant="outline">
              {showContextPanel ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
              {showContextPanel ? "Hide details" : "Show details"}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Workspace</CardTitle>
                <CardDescription>
                  {vaultPath === "Browser Demo Vault"
                    ? "Running in browser-safe mode"
                    : vaultPath || "No vault selected yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">Notes</div>
                    <div className="mt-1 text-xl font-semibold">{notes.length}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">Pinned</div>
                    <div className="mt-1 text-xl font-semibold">{pinnedCount}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">Tagged</div>
                    <div className="mt-1 text-xl font-semibold">{taggedCount}</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Ctrl/Cmd + N creates a note</div>
                  <div>Ctrl/Cmd + K focuses search</div>
                  <div>Ctrl/Cmd + S saves the editor</div>
                </div>
                {error ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                {isBooting ? (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                    Working...
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Find notes</CardTitle>
                <CardDescription>Quick local filtering while indexed search is still coming online.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    id="trace-note-search"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search titles, content, tags"
                    value={query}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", "All"],
                    ["pinned", "Pinned"],
                    ["tagged", "Tagged"],
                  ].map(([value, label]) => (
                    <Button
                      key={value}
                      onClick={() => setNoteFilter(value as "all" | "pinned" | "tagged")}
                      type="button"
                      variant={noteFilter === value ? "default" : "outline"}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredNotes.length} result{filteredNotes.length === 1 ? "" : "s"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Notes</CardTitle>
                <CardDescription>Pick a note from the list or create a new one.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <NoteList
                  activeNoteId={activeNoteId}
                  compactMode={compactMode}
                  notes={filteredNotes}
                  onSelect={setActiveNote}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-[780px]">
            <CardHeader className="pb-4">
              <CardTitle>Editor</CardTitle>
              <CardDescription>
                Markdown-first editing with autosave and keyboard shortcuts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoteEditor isSaving={isSaving} note={activeNote} onSave={saveActiveNote} />
            </CardContent>
          </Card>

          {showContextPanel ? (
            <div className="space-y-6 xl:block">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Current note</CardTitle>
                  <CardDescription>Metadata and writing context for the selected note.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {activeNote ? (
                    <>
                      <div>
                        <div className="text-xs text-muted-foreground">Path</div>
                        <div className="mt-1 break-all text-foreground">{activeNote.filePath}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Updated</div>
                        <div className="mt-1 text-foreground">
                          {formatDistanceToNow(new Date(activeNote.updatedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Tags</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeNote.tags.length > 0 ? (
                            activeNote.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No tags yet.</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">No note selected.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Status</CardTitle>
                  <CardDescription>What is present now and what comes next.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>Browser-safe fallback is active when you run the Vite frontend alone.</div>
                  <div>Dark mode and compact mode are persisted locally.</div>
                  <div>Backlinks and indexed search are still the next major backend steps.</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
