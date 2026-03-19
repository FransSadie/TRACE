import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import type { NoteRecord } from "../../types/note";

type NoteEditorProps = {
  note: NoteRecord | null;
  isSaving: boolean;
  onSave: (payload: {
    title: string;
    bodyMarkdown: string;
    tags: string[];
  }) => Promise<void>;
};

export function NoteEditor({ note, isSaving, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [tags, setTags] = useState("");
  const [dirty, setDirty] = useState(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBodyMarkdown(note?.bodyMarkdown ?? "");
    setTags(note?.tags.join(", ") ?? "");
    setDirty(false);
    initialLoadRef.current = true;
  }, [note]);

  const normalizedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  const savePayload = useMemo(
    () => ({
      title,
      bodyMarkdown,
      tags: normalizedTags,
    }),
    [bodyMarkdown, normalizedTags, title],
  );

  useEffect(() => {
    if (!note) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    if (!dirty) return;

    const timeoutId = window.setTimeout(() => {
      void onSave(savePayload).then(() => setDirty(false));
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [dirty, note, onSave, savePayload]);

  useEffect(() => {
    if (!note) return;

    const handleSaveShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void onSave(savePayload).then(() => setDirty(false));
      }
    };

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [note, onSave, savePayload]);

  const wordCount = useMemo(() => {
    const words = bodyMarkdown.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [bodyMarkdown]);

  if (!note) {
    return (
      <div className="flex min-h-[540px] items-center justify-center rounded-xl border border-dashed bg-card text-sm text-muted-foreground">
        Select a note or create a new one to begin writing.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <Input
          className="h-11 text-base font-medium"
          onChange={(event) => {
            setTitle(event.target.value);
            setDirty(true);
          }}
          placeholder="Untitled note"
          value={title}
        />
        <Button
          className="xl:w-[120px]"
          onClick={() => void onSave(savePayload).then(() => setDirty(false))}
          type="button"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={dirty ? "default" : "secondary"}>
          {dirty ? "Unsaved changes" : "Saved"}
        </Badge>
        <Badge variant="outline">{wordCount} words</Badge>
        <Badge variant="outline">Ctrl/Cmd + S</Badge>
      </div>

      <Input
        onChange={(event) => {
          setTags(event.target.value);
          setDirty(true);
        }}
        placeholder="Tags, comma-separated"
        value={tags}
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CodeMirror
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
          }}
          className="trace-editor text-sm"
          extensions={[markdown()]}
          minHeight="540px"
          onChange={(value) => {
            setBodyMarkdown(value);
            setDirty(true);
          }}
          value={bodyMarkdown}
        />
      </div>
    </div>
  );
}
