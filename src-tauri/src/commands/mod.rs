use std::sync::Mutex;

use chrono::Utc;
use tauri::State;

use crate::db::{init_database, list_notes, save_note_record};
use crate::files::{create_default_structure, create_note_file, ensure_vault_root, write_note_file};
use crate::parsing::infer_note_title;
use crate::parsing::models::{CreateNoteInput, NoteRecord, SaveNoteInput, VaultSnapshot, WorkspaceState};

#[derive(Default)]
pub struct TraceState {
    pub workspace: Mutex<WorkspaceState>,
}

fn snapshot_from_state(workspace: &WorkspaceState) -> VaultSnapshot {
    VaultSnapshot {
        vault_path: workspace.vault_path.clone(),
        notes: workspace.notes.clone(),
        active_note_id: workspace.active_note_id.clone(),
    }
}

#[tauri::command]
pub fn load_snapshot(state: State<'_, TraceState>) -> Result<VaultSnapshot, String> {
    let workspace = state.workspace.lock().map_err(|_| "state lock poisoned")?;
    Ok(snapshot_from_state(&workspace))
}

#[tauri::command]
pub fn bootstrap_vault(
    vault_path: String,
    state: State<'_, TraceState>,
) -> Result<VaultSnapshot, String> {
    ensure_vault_root(&vault_path).map_err(|error| error.to_string())?;
    create_default_structure(&vault_path).map_err(|error| error.to_string())?;
    init_database(&vault_path).map_err(|error| error.to_string())?;
    let notes = list_notes(&vault_path).map_err(|error| error.to_string())?;

    let mut workspace = state.workspace.lock().map_err(|_| "state lock poisoned")?;
    workspace.vault_path = Some(vault_path);
    workspace.active_note_id = notes.first().map(|note| note.id.clone());
    workspace.notes = notes;

    Ok(snapshot_from_state(&workspace))
}

#[tauri::command]
pub fn create_note(
    input: CreateNoteInput,
    state: State<'_, TraceState>,
) -> Result<VaultSnapshot, String> {
    let mut workspace = state.workspace.lock().map_err(|_| "state lock poisoned")?;
    let vault_path = workspace
        .vault_path
        .clone()
        .ok_or_else(|| "Vault is not initialized".to_string())?;

    let note = create_note_file(&vault_path, input).map_err(|error| error.to_string())?;
    save_note_record(&vault_path, &note).map_err(|error| error.to_string())?;
    workspace.notes = list_notes(&vault_path).map_err(|error| error.to_string())?;
    workspace.active_note_id = Some(note.id);

    Ok(snapshot_from_state(&workspace))
}

#[tauri::command]
pub fn save_note(
    input: SaveNoteInput,
    state: State<'_, TraceState>,
) -> Result<VaultSnapshot, String> {
    let mut workspace = state.workspace.lock().map_err(|_| "state lock poisoned")?;
    let vault_path = workspace
        .vault_path
        .clone()
        .ok_or_else(|| "Vault is not initialized".to_string())?;

    let existing = workspace
        .notes
        .iter()
        .find(|note| note.id == input.id)
        .cloned()
        .ok_or_else(|| "Note not found".to_string())?;

    let title = if input.title.trim().is_empty() {
        infer_note_title(&input.body_markdown)
    } else {
        input.title.trim().to_string()
    };

    let updated = NoteRecord {
        id: existing.id,
        title,
        body_markdown: input.body_markdown,
        notebook: existing.notebook,
        file_path: existing.file_path,
        tags: input.tags,
        is_pinned: existing.is_pinned,
        is_daily: existing.is_daily,
        created_at: existing.created_at,
        updated_at: Utc::now().to_rfc3339(),
    };

    write_note_file(&vault_path, &updated).map_err(|error| error.to_string())?;
    save_note_record(&vault_path, &updated).map_err(|error| error.to_string())?;
    workspace.notes = list_notes(&vault_path).map_err(|error| error.to_string())?;
    workspace.active_note_id = Some(updated.id.clone());

    Ok(snapshot_from_state(&workspace))
}
