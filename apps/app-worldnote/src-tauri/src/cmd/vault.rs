use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
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

#[derive(Debug, Serialize, Deserialize)]
struct WorldMetadata {
    name: String,
    description: String,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorldSummary {
    pub path: String,
    pub name: String,
    pub description: String,
    pub card_count: u32,
    pub last_opened: u64,
}

fn world_paths(root: &Path) -> (PathBuf, PathBuf, PathBuf, PathBuf) {
    let worldnote_dir = root.join(".worldnote");
    let lore_dir = root.join("lore");
    let manifest_path = root.join("canvas_manifest.json");
    let sqlite_path = worldnote_dir.join("index.db");
    (worldnote_dir, lore_dir, manifest_path, sqlite_path)
}

#[tauri::command]
pub fn create_world(root: String, name: String, description: String) -> Result<String, String> {
    let trimmed_name = name.trim();
    if trimmed_name.is_empty() {
        return Err("World name is required".to_string());
    }
    if trimmed_name.contains('/') || trimmed_name.contains('\\') {
        return Err("World name cannot contain path separators".to_string());
    }

    let parent = PathBuf::from(&root);
    let world_root = parent.join(trimmed_name);

    if world_root.exists() {
        return Err(format!(
            "A folder named \"{trimmed_name}\" already exists at this location"
        ));
    }

    let (worldnote_dir, lore_dir, manifest_path, sqlite_path) = world_paths(&world_root);

    fs::create_dir_all(&worldnote_dir).map_err(|error| error.to_string())?;
    fs::create_dir_all(&lore_dir).map_err(|error| error.to_string())?;

    let created_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_string());

    let metadata = WorldMetadata {
        name: trimmed_name.to_string(),
        description: description.trim().to_string(),
        created_at,
    };
    let metadata_path = worldnote_dir.join("world.json");
    let metadata_json =
        serde_json::to_string_pretty(&metadata).map_err(|error| error.to_string())?;
    fs::write(&metadata_path, metadata_json).map_err(|error| error.to_string())?;

    if !manifest_path.exists() {
        let manifest = CanvasManifest {
            id: Uuid::new_v4().to_string(),
            name: trimmed_name.to_string(),
            version: 1,
            nodes: vec![],
        };
        let json = serde_json::to_string_pretty(&manifest).map_err(|error| error.to_string())?;
        fs::write(&manifest_path, json).map_err(|error| error.to_string())?;
    }

    SqliteIndex::open(sqlite_path).map_err(|error| error.to_string())?;
    Ok(world_root.to_string_lossy().into_owned())
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

fn count_lore_cards(lore_dir: &Path) -> u32 {
    if !lore_dir.is_dir() {
        return 0;
    }

    fs::read_dir(lore_dir)
        .map(|entries| {
            entries
                .filter_map(Result::ok)
                .filter(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext == "json")
                })
                .count() as u32
        })
        .unwrap_or(0)
}

fn file_modified_secs(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

#[tauri::command]
pub fn list_worlds(root: String) -> Result<Vec<WorldSummary>, String> {
    let root_path = PathBuf::from(root.trim());
    if !root_path.is_dir() {
        return Ok(vec![]);
    }

    let mut worlds = Vec::new();
    let entries = fs::read_dir(&root_path).map_err(|error| error.to_string())?;

    for entry in entries.filter_map(Result::ok) {
        let world_path = entry.path();
        if !world_path.is_dir() {
            continue;
        }

        let (worldnote_dir, lore_dir, _, _) = world_paths(&world_path);
        let metadata_path = worldnote_dir.join("world.json");
        if !metadata_path.exists() {
            continue;
        }

        let metadata_json =
            fs::read_to_string(&metadata_path).map_err(|error| error.to_string())?;
        let metadata: WorldMetadata =
            serde_json::from_str(&metadata_json).map_err(|error| error.to_string())?;

        worlds.push(WorldSummary {
            path: world_path.to_string_lossy().into_owned(),
            name: metadata.name,
            description: metadata.description,
            card_count: count_lore_cards(&lore_dir),
            last_opened: file_modified_secs(&metadata_path),
        });
    }

    worlds.sort_by(|left, right| right.last_opened.cmp(&left.last_opened));
    Ok(worlds)
}
