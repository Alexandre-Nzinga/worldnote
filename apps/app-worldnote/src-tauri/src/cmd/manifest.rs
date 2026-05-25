use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasNodePlacement {
    #[serde(rename = "cardId")]
    pub card_id: String,
    pub x: f64,
    pub y: f64,
    pub z: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasManifest {
    pub id: String,
    pub name: String,
    pub version: u32,
    pub nodes: Vec<CanvasNodePlacement>,
}

fn manifest_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("canvas_manifest.json")
}

fn default_manifest() -> CanvasManifest {
    CanvasManifest {
        id: Uuid::new_v4().to_string(),
        name: "Main Canvas".to_string(),
        version: 1,
        nodes: vec![],
    }
}

fn load_or_default(vault: &str) -> Result<CanvasManifest, String> {
    let path = manifest_path(vault);
    if !path.exists() {
        return Ok(default_manifest());
    }
    let raw = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str::<CanvasManifest>(&raw).map_err(|error| error.to_string())
}

fn write_manifest(vault: &str, manifest: &CanvasManifest) -> Result<(), String> {
    let path = manifest_path(vault);
    let json = serde_json::to_string_pretty(manifest).map_err(|error| error.to_string())?;
    fs::write(path, json).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn load_canvas_manifest(vault: String) -> Result<CanvasManifest, String> {
    let manifest = load_or_default(&vault)?;
    Ok(manifest)
}

#[tauri::command]
pub fn update_canvas_manifest(vault: String, manifest: CanvasManifest) -> Result<(), String> {
    write_manifest(&vault, &manifest)
}

#[tauri::command]
pub fn update_canvas_manifest_node(
    vault: String,
    placement: CanvasNodePlacement,
) -> Result<(), String> {
    let mut manifest = load_or_default(&vault)?;
    if let Some(node) = manifest
        .nodes
        .iter_mut()
        .find(|node| node.card_id == placement.card_id)
    {
        *node = placement;
    } else {
        manifest.nodes.push(placement);
    }

    write_manifest(&vault, &manifest)
}

pub(crate) fn remove_node_from_manifest(vault: &str, card_id: &str) -> Result<(), String> {
    let mut manifest = load_or_default(vault)?;
    manifest.nodes.retain(|node| node.card_id != card_id);
    write_manifest(vault, &manifest)
}

#[tauri::command]
pub fn remove_canvas_manifest_node(vault: String, card_id: String) -> Result<(), String> {
    remove_node_from_manifest(&vault, &card_id)
}
