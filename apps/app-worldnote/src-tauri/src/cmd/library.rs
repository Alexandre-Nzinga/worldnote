use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use uuid::Uuid;
use worldnote_persistence::sqlite::SqliteIndex;

use super::manifest::{update_canvas_manifest_node, CanvasNodePlacement};

#[derive(Debug, Serialize, Deserialize)]
struct WorldMetadata {
    name: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    created_at: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    cover_image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryCard {
    pub world_path: String,
    pub world_name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub world_cover_image: Option<String>,
    pub card_id: String,
    pub card_type: String,
    pub name: String,
    pub created_at: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_fit: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_position: Option<serde_json::Value>,
    pub subtitle: String,
}

fn worldnote_dir(world_path: &Path) -> PathBuf {
    world_path.join(".worldnote")
}

fn world_metadata_path(world_path: &Path) -> PathBuf {
    worldnote_dir(world_path).join("world.json")
}

fn lore_dir(world_path: &Path) -> PathBuf {
    world_path.join("lore")
}

fn sqlite_path(world_path: &Path) -> PathBuf {
    worldnote_dir(world_path).join("index.db")
}

fn card_assets_dir(world_path: &Path, card_id: &str) -> PathBuf {
    worldnote_dir(world_path).join("assets").join(card_id)
}

fn file_modified_secs(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
}

fn read_world_metadata(world_path: &Path) -> Result<WorldMetadata, String> {
    let metadata_json =
        fs::read_to_string(world_metadata_path(world_path)).map_err(|error| error.to_string())?;
    serde_json::from_str(&metadata_json).map_err(|error| error.to_string())
}

fn is_world_folder(world_path: &Path) -> bool {
    world_path.is_dir()
        && world_metadata_path(world_path).exists()
        && lore_dir(world_path).is_dir()
}

fn extract_string_field(card: &serde_json::Value, key: &str) -> Option<String> {
    card.get(key).and_then(|value| value.as_str()).map(ToString::to_string)
}

fn capitalize_first(value: &str) -> String {
    let mut chars = value.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

fn subtitle_for_card(card: &serde_json::Value, card_type: &str) -> String {
    let type_label = |fallback: &str| fallback.to_string();

    match card_type {
        "character" => extract_string_field(card, "birthdate")
            .filter(|value| !value.trim().is_empty())
            .or_else(|| extract_string_field(card, "description").filter(|value| !value.trim().is_empty()))
            .unwrap_or_else(|| type_label("Character")),
        "location" => extract_string_field(card, "coordinates")
            .filter(|value| !value.trim().is_empty())
            .or_else(|| extract_string_field(card, "description").filter(|value| !value.trim().is_empty()))
            .unwrap_or_else(|| type_label("Location")),
        "item" => extract_string_field(card, "rarity")
            .map(|value| capitalize_first(value.trim()))
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| type_label("Item")),
        "vehicle" => extract_string_field(card, "max_speed")
            .filter(|value| !value.trim().is_empty())
            .or_else(|| extract_string_field(card, "sub_type"))
            .unwrap_or_else(|| type_label("Vehicle")),
        "flora" => extract_string_field(card, "toxicity_level")
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| type_label("Flora")),
        "fauna" => extract_string_field(card, "diet")
            .map(|value| capitalize_first(value.trim()))
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| type_label("Fauna")),
        "structure" => extract_string_field(card, "condition")
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| type_label("Structure")),
        "species" => extract_string_field(card, "average_lifespan")
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| type_label("Species")),
        "building" => extract_string_field(card, "description")
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| type_label("Building")),
        _ => type_label(card_type),
    }
}

fn extract_tags(card: &serde_json::Value) -> Vec<String> {
    card.get("tags")
        .and_then(|value| value.as_array())
        .map(|array| {
            array
                .iter()
                .filter_map(|item| item.as_str().map(ToString::to_string))
                .collect::<Vec<_>>()
        })
        .unwrap_or_default()
}

#[tauri::command]
pub fn list_all_cards(root: String) -> Result<Vec<LibraryCard>, String> {
    let root_path = PathBuf::from(root.trim());
    if !root_path.is_dir() {
        return Ok(vec![]);
    }

    let mut items: Vec<LibraryCard> = vec![];
    let entries = fs::read_dir(&root_path).map_err(|error| error.to_string())?;

    for entry in entries.filter_map(Result::ok) {
        let world_path = entry.path();
        if !is_world_folder(&world_path) {
            continue;
        }

        let metadata = read_world_metadata(&world_path)?;
        let lore = lore_dir(&world_path);
        let lore_entries = fs::read_dir(&lore).map_err(|error| error.to_string())?;

        for card_entry in lore_entries.filter_map(Result::ok) {
            let card_path = card_entry.path();
            if !card_path
                .extension()
                .is_some_and(|ext| ext.to_string_lossy().to_lowercase() == "json")
            {
                continue;
            }

            let raw = fs::read_to_string(&card_path).map_err(|error| error.to_string())?;
            let card: serde_json::Value =
                serde_json::from_str(&raw).map_err(|error| error.to_string())?;

            let card_id = extract_string_field(&card, "id");
            let name = extract_string_field(&card, "name");
            let card_type = extract_string_field(&card, "card_type");

            let (Some(card_id), Some(name), Some(card_type)) = (card_id, name, card_type) else {
                continue;
            };

            items.push(LibraryCard {
                world_path: world_path.to_string_lossy().into_owned(),
                world_name: metadata.name.clone(),
                world_cover_image: metadata.cover_image.clone(),
                card_id,
                card_type: card_type.clone(),
                name,
                created_at: file_modified_secs(&card_path),
                image_path: extract_string_field(&card, "image_path"),
                image_fit: extract_string_field(&card, "image_fit"),
                image_position: card
                    .get("image_position")
                    .filter(|value| value.is_object())
                    .cloned(),
                subtitle: subtitle_for_card(&card, &card_type),
            });
        }
    }

    Ok(items)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CopyPosition {
    pub x: f64,
    pub y: f64,
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

#[tauri::command]
pub fn copy_card_to_world(
    source_world_path: String,
    target_world_path: String,
    card_id: String,
    position: CopyPosition,
) -> Result<LibraryCard, String> {
    let source_world = PathBuf::from(source_world_path.trim());
    let target_world = PathBuf::from(target_world_path.trim());

    if !is_world_folder(&source_world) {
        return Err("Source world is not a valid WorldNote world".to_string());
    }
    if !is_world_folder(&target_world) {
        return Err("Target world is not a valid WorldNote world".to_string());
    }
    if source_world == target_world {
        return Err("Cannot copy a card into the same world".to_string());
    }

    let source_card_path = lore_dir(&source_world).join(format!("{card_id}.json"));
    if !source_card_path.is_file() {
        return Err("Card does not exist in the source world".to_string());
    }

    let raw = fs::read_to_string(&source_card_path).map_err(|error| error.to_string())?;
    let mut card: serde_json::Value =
        serde_json::from_str(&raw).map_err(|error| error.to_string())?;

    let new_id = Uuid::new_v4().to_string();
    card["id"] = serde_json::Value::String(new_id.clone());
    card["position"] = serde_json::json!({ "x": position.x, "y": position.y });
    rewrite_image_path(&mut card, &card_id, &new_id);

    let source_assets = card_assets_dir(&source_world, &card_id);
    let target_assets = card_assets_dir(&target_world, &new_id);
    if source_assets.is_dir() {
        copy_dir_all(&source_assets, &target_assets)?;
    }

    let target_lore = lore_dir(&target_world);
    fs::create_dir_all(&target_lore).map_err(|error| error.to_string())?;
    let target_card_path = target_lore.join(format!("{new_id}.json"));
    let json = serde_json::to_string_pretty(&card).map_err(|error| error.to_string())?;
    fs::write(&target_card_path, json).map_err(|error| error.to_string())?;

    let name = extract_string_field(&card, "name").unwrap_or_else(|| "Untitled".to_string());
    let tags = extract_tags(&card);
    let index = SqliteIndex::open(sqlite_path(&target_world)).map_err(|error| error.to_string())?;
    index
        .upsert(&new_id, &name, &tags)
        .map_err(|error| error.to_string())?;

    update_canvas_manifest_node(
        target_world.to_string_lossy().into_owned(),
        CanvasNodePlacement {
            card_id: new_id.clone(),
            x: position.x,
            y: position.y,
            z: None,
        },
    )?;

    let target_metadata = read_world_metadata(&target_world)?;
    let card_type =
        extract_string_field(&card, "card_type").unwrap_or_else(|| "unknown".to_string());
    Ok(LibraryCard {
        world_path: target_world.to_string_lossy().into_owned(),
        world_name: target_metadata.name,
        world_cover_image: target_metadata.cover_image,
        card_id: new_id,
        card_type: card_type.clone(),
        name,
        created_at: file_modified_secs(&target_card_path),
        image_path: extract_string_field(&card, "image_path"),
        image_fit: extract_string_field(&card, "image_fit"),
        image_position: card
            .get("image_position")
            .filter(|value| value.is_object())
            .cloned(),
        subtitle: subtitle_for_card(&card, &card_type),
    })
}

