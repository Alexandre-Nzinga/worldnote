use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StickyNoteMarkdownEntry {
    pub id: String,
    pub content: String,
}

fn sticky_notes_dir(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("sticky-notes")
}

fn sticky_note_path(vault: &str, id: &str) -> PathBuf {
    sticky_notes_dir(vault).join(format!("{id}.md"))
}

#[tauri::command]
pub fn write_sticky_note_markdown(
    vault: String,
    id: String,
    markdown: String,
) -> Result<(), String> {
    let dir = sticky_notes_dir(&vault);
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let path = sticky_note_path(&vault, &id);
    fs::write(path, markdown).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_sticky_note_markdown(vault: String) -> Result<Vec<StickyNoteMarkdownEntry>, String> {
    let dir = sticky_notes_dir(&vault);
    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(&dir).map_err(|error| error.to_string())?;
    for entry in read_dir {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }
        let Some(stem) = path.file_stem().and_then(|s| s.to_str()) else {
            continue;
        };
        let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
        entries.push(StickyNoteMarkdownEntry {
            id: stem.to_string(),
            content,
        });
    }
    Ok(entries)
}

#[tauri::command]
pub fn delete_sticky_note_markdown(vault: String, id: String) -> Result<(), String> {
    let path = sticky_note_path(&vault, &id);
    if path.exists() {
        fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    Ok(())
}
