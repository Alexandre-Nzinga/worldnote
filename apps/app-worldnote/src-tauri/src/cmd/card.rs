use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;
use worldnote_persistence::repository::{CardRepository, JsonCardRepository};
use worldnote_persistence::sqlite::SqliteIndex;

use super::manifest::{update_canvas_manifest_node, CanvasNodePlacement};

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

fn card_lore_assets_dir(vault: &str, card_id: &str) -> PathBuf {
    card_assets_dir(vault, card_id).join("lore")
}

fn copy_dir_all(source: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination).map_err(|error| error.to_string())?;
    for entry in fs::read_dir(source).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        let dest = destination.join(entry.file_name());
        if path.is_dir() {
            copy_dir_all(&path, &dest)?;
        } else {
            fs::copy(&path, &dest).map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn rewrite_image_path(card: &mut serde_json::Value, old_id: &str, new_id: &str) {
    let Some(image_path) = card.get("image_path").and_then(|value| value.as_str()) else {
        return;
    };
    let old_fragment = format!(".worldnote/assets/{old_id}/");
    let new_fragment = format!(".worldnote/assets/{new_id}/");
    let rewritten = image_path.replace('\\', "/").replace(&old_fragment, &new_fragment);
    if rewritten != image_path {
        card["image_path"] = serde_json::Value::String(rewritten);
    }
}

fn position_offset(card: &serde_json::Value, offset_x: f64, offset_y: f64) -> (f64, f64) {
    let position = card.get("position").and_then(|value| value.as_object());
    let x = position
        .and_then(|value| value.get("x"))
        .and_then(|value| value.as_f64())
        .unwrap_or(0.0);
    let y = position
        .and_then(|value| value.get("y"))
        .and_then(|value| value.as_f64())
        .unwrap_or(0.0);
    (x + offset_x, y + offset_y)
}

#[tauri::command]
pub fn duplicate_card(
    vault: String,
    card_id: String,
    offset_x: f64,
    offset_y: f64,
) -> Result<serde_json::Value, String> {
    let source_card_path = lore_root(&vault).join(format!("{card_id}.json"));
    if !source_card_path.is_file() {
        return Err("Card does not exist".to_string());
    }

    let raw = fs::read_to_string(&source_card_path).map_err(|error| error.to_string())?;
    let mut card: serde_json::Value =
        serde_json::from_str(&raw).map_err(|error| error.to_string())?;

    let new_id = Uuid::new_v4().to_string();
    let (x, y) = position_offset(&card, offset_x, offset_y);
    card["id"] = serde_json::Value::String(new_id.clone());
    card["position"] = serde_json::json!({ "x": x, "y": y });
    rewrite_image_path(&mut card, &card_id, &new_id);

    if let Some(name) = card.get("name").and_then(|value| value.as_str()) {
        card["name"] = serde_json::Value::String(format!("{name} copy"));
    }

    let source_assets = card_assets_dir(&vault, &card_id);
    let target_assets = card_assets_dir(&vault, &new_id);
    if source_assets.is_dir() {
        copy_dir_all(&source_assets, &target_assets)?;
    }

    let repo = JsonCardRepository::new(lore_root(&vault));
    repo.upsert(&new_id, &card)
        .map_err(|error| error.to_string())?;

    let name = card
        .get("name")
        .and_then(|value| value.as_str())
        .unwrap_or("Untitled");
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

    let index = SqliteIndex::open(sqlite_path(&vault)).map_err(|error| error.to_string())?;
    index
        .upsert(&new_id, name, &tags)
        .map_err(|error| error.to_string())?;

    update_canvas_manifest_node(
        vault,
        CanvasNodePlacement {
            card_id: new_id,
            x,
            y,
            z: None,
        },
    )?;

    Ok(card)
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

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CardIndexRow {
    pub id: String,
    pub name: String,
    pub tags: Vec<String>,
}

/// Lists card metadata from the world's SQLite search index (`.worldnote/index.db`).
#[tauri::command]
pub fn list_card_index(vault: String) -> Result<Vec<CardIndexRow>, String> {
    let index = SqliteIndex::open(sqlite_path(&vault)).map_err(|error| error.to_string())?;
    let rows = index.list_all().map_err(|error| error.to_string())?;
    Ok(rows
        .into_iter()
        .map(|(id, name, tags)| CardIndexRow { id, name, tags })
        .collect())
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

#[tauri::command]
pub fn add_card_lore_image(
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

    let lore_dir = card_lore_assets_dir(&vault, &card_id);
    fs::create_dir_all(&lore_dir).map_err(|error| error.to_string())?;

    let file_id = Uuid::new_v4().to_string();
    let dest = lore_dir.join(format!("{file_id}.{extension}"));
    fs::copy(&source, &dest).map_err(|error| error.to_string())?;

    let relative = Path::new(".worldnote")
        .join("assets")
        .join(&card_id)
        .join("lore")
        .join(format!("{file_id}.{extension}"));

    Ok(relative.to_string_lossy().replace('\\', "/"))
}
