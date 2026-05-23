use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;
use worldnote_persistence::sqlite::SqliteIndex;

#[derive(Debug, Serialize, Deserialize)]
struct CanvasNodePlacement {
    #[serde(rename = "cardId")]
    card_id: String,
    x: f64,
    y: f64,
    z: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CanvasManifest {
    id: String,
    name: String,
    version: u32,
    nodes: Vec<CanvasNodePlacement>,
}

fn world_paths(root: &Path) -> (PathBuf, PathBuf, PathBuf, PathBuf) {
    let worldnote_dir = root.join(".worldnote");
    let lore_dir = root.join("lore");
    let manifest_path = root.join("canvas_manifest.json");
    let sqlite_path = worldnote_dir.join("index.db");
    (worldnote_dir, lore_dir, manifest_path, sqlite_path)
}

#[tauri::command]
pub fn create_world(root: String) -> Result<String, String> {
    let root_path = PathBuf::from(&root);
    let (worldnote_dir, lore_dir, manifest_path, sqlite_path) = world_paths(&root_path);

    fs::create_dir_all(&worldnote_dir).map_err(|error| error.to_string())?;
    fs::create_dir_all(&lore_dir).map_err(|error| error.to_string())?;

    if !manifest_path.exists() {
        let manifest = CanvasManifest {
            id: Uuid::new_v4().to_string(),
            name: "Main Canvas".to_string(),
            version: 1,
            nodes: vec![],
        };
        let json = serde_json::to_string_pretty(&manifest).map_err(|error| error.to_string())?;
        fs::write(&manifest_path, json).map_err(|error| error.to_string())?;
    }

    SqliteIndex::open(sqlite_path).map_err(|error| error.to_string())?;
    Ok(root)
}

#[tauri::command]
pub fn open_world(root: String) -> Result<String, String> {
    let root_path = PathBuf::from(&root);
    let (worldnote_dir, lore_dir, manifest_path, sqlite_path) = world_paths(&root_path);

    if !root_path.exists() {
        return Err("World folder does not exist".to_string());
    }
    if !worldnote_dir.exists() || !lore_dir.exists() {
        return Err("Selected folder is not an initialized WorldNote vault".to_string());
    }
    if !manifest_path.exists() {
        return Err("Vault is missing canvas_manifest.json".to_string());
    }

    SqliteIndex::open(sqlite_path).map_err(|error| error.to_string())?;
    Ok(root)
}
