use crate::parsing::models::NoteRecord;

pub fn serialize_note(note: &NoteRecord, body: &str) -> String {
    let mut output = String::new();
    output.push_str("---\n");
    output.push_str(&format!("id: {}\n", note.id));
    output.push_str(&format!("title: {}\n", note.title));
    output.push_str(&format!("created_at: {}\n", note.created_at));
    output.push_str(&format!("updated_at: {}\n", note.updated_at));
    output.push_str("tags:\n");
    for tag in &note.tags {
        output.push_str(&format!("  - {}\n", tag));
    }
    output.push_str(&format!("notebook: {}\n", note.notebook));
    output.push_str(&format!("pinned: {}\n", note.is_pinned));
    output.push_str(&format!("daily: {}\n", note.is_daily));
    output.push_str("---\n\n");
    output.push_str(body);
    output
}
