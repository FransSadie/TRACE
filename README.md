# Trace

Trace is a local-first desktop knowledge base for engineers. This scaffold sets up the project around a Tauri 2 shell, a React and TypeScript frontend, Markdown notes as the canonical data store, and SQLite as the embedded metadata and search layer.

## What is included

- A Vite + React + TypeScript frontend shell
- Tailwind-based application styling
- A three-pane workspace layout
- A markdown-first note editor using CodeMirror
- Zustand store wiring for vault bootstrap, note creation, and note save commands
- Shared TypeScript parsing helpers for frontmatter, slugs, and wiki links
- Vitest coverage for those helpers
- A Tauri-ready Rust module layout for commands, vault files, parsing, indexing, and SQLite setup

## Current state

The frontend is runnable once dependencies are installed. The Rust side is scaffolded and organized, but this machine does not currently have the Rust toolchain installed, so Tauri compilation was not verified here.

## Frontend commands

```bash
npm install
npm run dev
npm run test
```

## To complete the desktop build

1. Install the Rust toolchain.
2. Install Tauri prerequisites for your OS.
3. Add the Tauri CLI if you want local desktop commands.
4. Run the frontend install step.
5. Build and run the Tauri app.

## Project structure

```text
src/
  app/
  components/
  features/
    layout/
    notes/
    settings/
  lib/
  stores/
  types/
src-tauri/
  src/
    commands/
    db/
    files/
    indexing/
    parsing/
docs/
tests/
```

## Leading direction

This scaffold is intentionally centered around one vertical slice:

- choose a vault
- create a note
- write a Markdown file with frontmatter
- persist note metadata to SQLite
- keep the code organized so search, backlinks, daily notes, and rebuild flows slot in next
