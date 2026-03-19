import { formatDistanceToNow } from "date-fns";
import { Pin } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import type { NoteRecord } from "../../types/note";

type NoteListProps = {
  notes: NoteRecord[];
  activeNoteId: string | null;
  onSelect: (noteId: string) => void;
  compactMode?: boolean;
};

export function NoteList({
  notes,
  activeNoteId,
  onSelect,
  compactMode = false,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        No notes match the current view yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => {
        const isActive = note.id === activeNoteId;

        return (
          <li key={note.id}>
            <button
              className={cn(
                "w-full rounded-xl border bg-card p-4 text-left shadow-sm transition hover:bg-accent/60",
                isActive && "border-primary bg-accent",
                compactMode && "p-3",
              )}
              onClick={() => onSelect(note.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {note.title}
                  </div>
                  {!compactMode ? (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {note.bodyMarkdown || "Empty note"}
                    </div>
                  ) : null}
                </div>
                {note.isPinned ? (
                  <Pin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {note.notebook}
                </Badge>
                {note.tags.slice(0, compactMode ? 2 : 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
