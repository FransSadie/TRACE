use crate::parsing::models::NoteRecord;

pub fn extract_search_text(note: &NoteRecord) -> String {
    let mut parts = vec![
        note.title.clone(),
        note.body_markdown.clone(),
        note.notebook.clone(),
    ];
    if !note.tags.is_empty() {
        parts.push(note.tags.join(" "));
    }

    parts.join("\n")
}
