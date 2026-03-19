use std::fs;
use std::path::{Path, PathBuf};

use chrono::Utc;
use thiserror::Error;
use uuid::Uuid;

use crate::parsing::frontmatter::serialize_note;
use crate::parsing::models::{CreateNoteInput, NoteRecord};
use crate::parsing::{infer_note_title, slugify};

#[derive(Debug, Error)]
pub enum FileError {
    #[error("invalid vault path")]
    InvalidVaultPath,
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

pub fn ensure_vault_root(vault_path: &str) -> Result<(), FileError> {
    let path = Path::new(vault_path);
    if !path.exists() || !path.is_dir() {
        return Err(FileError::InvalidVaultPath);
    }

    Ok(())
}

pub fn create_default_structure(vault_path: &str) -> Result<(), FileError> {
    let trace_root = Path::new(vault_path).join(".trace");
    fs::create_dir_all(Path::new(vault_path).join("Inbox"))?;
    fs::create_dir_all(Path::new(vault_path).join("Daily"))?;
    fs::create_dir_all(trace_root)?;
    Ok(())
}

pub fn create_note_file(
    vault_path: &str,
    input: CreateNoteInput,
) -> Result<NoteRecord, FileError> {
    let now = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();
    let title = input.title.unwrap_or_else(|| "Untitled Note".to_string());
    let notebook = input.notebook.unwrap_or_else(|| "Inbox".to_string());
    let slug = slugify(&title);
    let relative_path = format!("{}/{}.md", notebook, slug);

    let note = NoteRecord {
        id,
        title,
        body_markdown: String::new(),
        notebook,
        file_path: relative_path,
        tags: Vec::new(),
        is_pinned: false,
        is_daily: false,
        created_at: now.clone(),
        updated_at: now,
    };

    write_note_file(vault_path, &note)?;
    Ok(note)
}

pub fn write_note_file(vault_path: &str, note: &NoteRecord) -> Result<(), FileError> {
    let body = if note.body_markdown.trim().is_empty() {
        format!("# {}\n", infer_note_title(&note.title))
    } else {
        note.body_markdown.clone()
    };

    let absolute_path = PathBuf::from(vault_path).join(&note.file_path);
    if let Some(parent) = absolute_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_path = absolute_path.with_extension("md.tmp");
    fs::write(&temp_path, serialize_note(note, &body))?;
    fs::rename(temp_path, absolute_path)?;
    Ok(())
}
