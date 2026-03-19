# Trace Development Log

## 2026-03-17

### Foundation

- Reworked the product spec to replace Postgres with SQLite and align the MVP around a markdown-first editor.
- Scaffolded the repo for a Tauri 2 + React + TypeScript desktop app.
- Added the initial React workspace shell, state store, parser utilities, and tests.
- Added the Rust-side structure for commands, files, parsing, indexing, and SQLite persistence.

### Tooling and verification

- Installed frontend dependencies and verified the frontend build and tests.
- Verified Rust and Cargo availability through the user toolchain path.
- Confirmed the Visual Studio build tools were installed and compile-capable through the developer command prompt.
- Fixed Tauri packaging requirements by adding real icon assets and updating config.
- Verified the backend with `cargo check`.

### UI quality-of-life pass

- Added browser-safe fallback storage so the frontend can be explored without launching the desktop shell.
- Added persistent dark mode.
- Added persistent compact mode.
- Added a toggleable context panel for focus mode.
- Added a local quick-find input and note filter chips.
- Added keyboard shortcuts for note creation, quick search focus, save, and error clearing.
- Added autosave behavior and save-state feedback in the editor.
- Added small workspace stats and clearer browser-vs-desktop mode signaling.

### UI redesign

- Removed the logo-led presentation from the interface.
- Rebuilt the visible UI around a shadcn-style component layer with reusable button, card, input, badge, and separator primitives.
- Switched the visual language to a cleaner neutral layout with a proper app header, sidebar cards, and structured editor/details panes.

### Next likely steps

- Replace local quick-find with SQLite-backed search.
- Add backlink extraction and backlink display from indexed note content.
- Build daily notes, recents, and tag filtering into the real backend flow.
- Add note load and rebuild-from-files commands on the Rust side.
