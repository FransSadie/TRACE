# Trace Architecture

## Core model

Trace uses Markdown files as the canonical storage layer and SQLite as a derived local index. That keeps user data transparent while still allowing fast search, backlinks, recents, and UI queries.

## Save flow

1. The frontend invokes a Rust command.
2. Rust validates the vault path and note input.
3. Rust serializes frontmatter and writes the Markdown file atomically.
4. Rust updates SQLite metadata and FTS state.
5. Rust returns a fresh workspace snapshot to the UI.

## Module split

- `commands/`: Tauri command handlers and snapshot orchestration
- `db/`: SQLite setup and note persistence
- `files/`: vault creation, path rules, file writes, and file reads
- `indexing/`: FTS and link indexing
- `parsing/`: frontmatter, titles, slugs, and wiki-link extraction

## Why this split

The module boundaries line up with the main long-term constraints:

- file safety
- file/index consistency
- rebuildability from the vault
- testable parsing and indexing logic
