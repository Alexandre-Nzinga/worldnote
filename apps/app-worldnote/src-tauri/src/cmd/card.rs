use std::fs;
use std::path::{Path, PathBuf};
use worldnote_persistence::repository::{CardRepository, JsonCardRepository};
use worldnote_persistence::sqlite::SqliteIndex;

fn lore_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("lore")
}

fn sqlite_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join(".worldnote").join("index.db")
}

fn card_assets_dir(vault: &str, card_id: &str) -> PathBuf {
    PathBuf::from(vault)
        .join(".worldnote")
        .join("assets")
        .join(card_id)
}

#[tauri::command]
pub fn upsert_card(vault: String, card: serde_json::Value) -> Result<(), String> {
    let id = card
        .get("id")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "Card payload is missing required 'id'".to_string())?;
    let name = card
        .get("name")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "Card payload is missing required 'name'".to_string())?;
    let tags = card
        .get("tags")
        .and_then(|value| value.as_array())
        .map(|array| {
            array
                .iter()
                .filter_map(|item| item.as_str().map(ToString::to_string))
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let repo = JsonCardRepository::new(lore_root(&vault));
    repo.upsert(id, &card).map_err(|error| error.to_string())?;

    let index = SqliteIndex::open(sqlite_path(&vault)).map_err(|error| error.to_string())?;
    index
        .upsert(id, name, &tags)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_cards(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let repo = JsonCardRepository::new(lore_root(&vault));

    let mut cards = vec![];
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(card) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            cards.push(card);
        }
    }
    Ok(cards)
}

#[tauri::command]
pub fn delete_card(vault: String, id: String) -> Result<(), String> {
    let repo = JsonCardRepository::new(lore_root(&vault));
    repo.delete(&id).map_err(|error| error.to_string())?;

    let index = SqliteIndex::open(sqlite_path(&vault)).map_err(|error| error.to_string())?;
    index.delete(&id).map_err(|error| error.to_string())?;

    let assets_dir = card_assets_dir(&vault, &id);
    if assets_dir.exists() {
        fs::remove_dir_all(assets_dir).map_err(|error| error.to_string())?;
    }

    super::link::delete_links_referencing_card(&vault, &id)?;
    super::manifest::remove_node_from_manifest(&vault, &id)
}

#[tauri::command]
pub fn save_card_image(
    vault: String,
    card_id: String,
    source_path: String,
) -> Result<String, String> {
    let source = PathBuf::from(&source_path);
    if !source.is_file() {
        return Err("Image file does not exist".to_string());
    }

    let extension = source
        .extension()
        .and_then(|ext| ext.to_str())
        .filter(|ext| !ext.is_empty())
        .unwrap_or("png");

    let assets_dir = card_assets_dir(&vault, &card_id);
    fs::create_dir_all(&assets_dir).map_err(|error| error.to_string())?;

    if assets_dir.exists() {
        for entry in fs::read_dir(&assets_dir).map_err(|error| error.to_string())? {
            let entry = entry.map_err(|error| error.to_string())?;
            let path = entry.path();
            if path.is_file() {
                fs::remove_file(path).map_err(|error| error.to_string())?;
            }
        }
    }

    let dest = assets_dir.join(format!("cover.{extension}"));
    fs::copy(&source, &dest).map_err(|error| error.to_string())?;

    let relative = Path::new(".worldnote")
        .join("assets")
        .join(&card_id)
        .join(format!("cover.{extension}"));

    Ok(relative.to_string_lossy().replace('\\', "/"))
}
