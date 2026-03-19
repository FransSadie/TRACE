mod commands;
mod db;
mod files;
mod indexing;
mod parsing;

use commands::{bootstrap_vault, create_note, load_snapshot, save_note, TraceState};

fn main() {
    tauri::Builder::default()
        .manage(TraceState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            bootstrap_vault,
            load_snapshot,
            create_note,
            save_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running Trace");
}
