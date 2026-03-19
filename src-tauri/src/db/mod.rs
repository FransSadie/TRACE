use std::path::PathBuf;

use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};

use crate::parsing::models::NoteRecord;

fn db_path(vault_path: &str) -> PathBuf {
    PathBuf::from(vault_path).join(".trace").join("trace.db")
}

fn open_connection(vault_path: &str) -> rusqlite::Result<Connection> {
    let connection = Connection::open(db_path(vault_path))?;
    connection.pragma_update(None, "journal_mode", "WAL")?;
    Ok(connection)
}

pub fn init_database(vault_path: &str) -> rusqlite::Result<()> {
    let connection = open_connection(vault_path)?;

    connection.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          body_markdown TEXT NOT NULL,
          notebook TEXT NOT NULL,
          file_path TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_pinned INTEGER NOT NULL DEFAULT 0,
          is_daily INTEGER NOT NULL DEFAULT 0,
          content_hash TEXT NOT NULL
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS fts_notes USING fts5(
          title,
          body_markdown,
          notebook,
          tags_text,
          content='notes',
          content_rowid='rowid'
        );
        "
    )?;

    Ok(())
}

pub fn save_note_record(vault_path: &str, note: &NoteRecord) -> rusqlite::Result<()> {
    let connection = open_connection(vault_path)?;
    let tags_text = note.tags.join(" ");
    let content_hash = {
        let mut hasher = Sha256::new();
        hasher.update(&note.title);
        hasher.update(&note.body_markdown);
        hasher.update(&tags_text);
        format!("{:x}", hasher.finalize())
    };

    connection.execute(
        "
        INSERT INTO notes (
          id, title, body_markdown, notebook, file_path, created_at, updated_at, is_pinned, is_daily, content_hash
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          body_markdown = excluded.body_markdown,
          notebook = excluded.notebook,
          file_path = excluded.file_path,
          updated_at = excluded.updated_at,
          is_pinned = excluded.is_pinned,
          is_daily = excluded.is_daily,
          content_hash = excluded.content_hash
        ",
        params![
            note.id,
            note.title,
            note.body_markdown,
            note.notebook,
            note.file_path,
            note.created_at,
            note.updated_at,
            i32::from(note.is_pinned),
            i32::from(note.is_daily),
            content_hash,
        ],
    )?;

    let row_id: i64 = connection.query_row(
        "SELECT rowid FROM notes WHERE id = ?1",
        params![note.id],
        |row| row.get(0),
    )?;

    connection.execute("DELETE FROM fts_notes WHERE rowid = ?1", params![row_id])?;
    connection.execute(
        "
        INSERT INTO fts_notes(rowid, title, body_markdown, notebook, tags_text)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ",
        params![row_id, note.title, note.body_markdown, note.notebook, tags_text],
    )?;

    Ok(())
}

pub fn list_notes(vault_path: &str) -> rusqlite::Result<Vec<NoteRecord>> {
    let connection = open_connection(vault_path)?;
    let mut statement = connection.prepare(
        "
        SELECT id, title, body_markdown, notebook, file_path, created_at, updated_at, is_pinned, is_daily
        FROM notes
        ORDER BY updated_at DESC
        ",
    )?;

    let rows = statement.query_map([], |row| {
        Ok(NoteRecord {
            id: row.get(0)?,
            title: row.get(1)?,
            body_markdown: row.get(2)?,
            notebook: row.get(3)?,
            file_path: row.get(4)?,
            tags: Vec::new(),
            is_pinned: row.get::<_, i32>(7)? == 1,
            is_daily: row.get::<_, i32>(8)? == 1,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;

    rows.collect()
}
