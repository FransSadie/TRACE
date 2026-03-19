use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteRecord {
    pub id: String,
    pub title: String,
    pub body_markdown: String,
    pub notebook: String,
    pub file_path: String,
    pub tags: Vec<String>,
    pub is_pinned: bool,
    pub is_daily: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultSnapshot {
    pub vault_path: Option<String>,
    pub notes: Vec<NoteRecord>,
    pub active_note_id: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct WorkspaceState {
    pub vault_path: Option<String>,
    pub notes: Vec<NoteRecord>,
    pub active_note_id: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNoteInput {
    pub title: Option<String>,
    pub notebook: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveNoteInput {
    pub id: String,
    pub title: String,
    pub body_markdown: String,
    pub tags: Vec<String>,
}
