use std::fs;
use std::path::{Path, PathBuf};

use super::manifest::remove_image_from_manifest;

fn canvas_images_dir(vault: &str) -> PathBuf {
    PathBuf::from(vault)
        .join(".worldnote")
        .join("assets")
        .join("canvas")
}

#[tauri::command]
pub fn save_canvas_image(
    vault: String,
    image_id: String,
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

    let images_dir = canvas_images_dir(&vault);
    fs::create_dir_all(&images_dir).map_err(|error| error.to_string())?;

    let dest = images_dir.join(format!("{image_id}.{extension}"));
    fs::copy(&source, &dest).map_err(|error| error.to_string())?;

    let relative = Path::new(".worldnote")
        .join("assets")
        .join("canvas")
        .join(format!("{image_id}.{extension}"));

    Ok(relative.to_string_lossy().replace('\\', "/"))
}

#[tauri::command]
pub fn save_canvas_image_bytes(
    vault: String,
    image_id: String,
    file_name: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    if bytes.is_empty() {
        return Err("Image file is empty".to_string());
    }

    let file_path = PathBuf::from(&file_name);
    let extension = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .filter(|ext| !ext.is_empty())
        .unwrap_or("png")
        .to_string();

    let images_dir = canvas_images_dir(&vault);
    fs::create_dir_all(&images_dir).map_err(|error| error.to_string())?;

    let dest = images_dir.join(format!("{image_id}.{extension}"));
    fs::write(&dest, bytes).map_err(|error| error.to_string())?;

    let relative = Path::new(".worldnote")
        .join("assets")
        .join("canvas")
        .join(format!("{image_id}.{extension}"));

    Ok(relative.to_string_lossy().replace('\\', "/"))
}

#[tauri::command]
pub fn delete_canvas_image(vault: String, image_id: String) -> Result<(), String> {
    let images_dir = canvas_images_dir(&vault);
    if images_dir.is_dir() {
        for entry in fs::read_dir(&images_dir).map_err(|error| error.to_string())? {
            let entry = entry.map_err(|error| error.to_string())?;
            let path = entry.path();
            if path.is_file() {
                let stem = path
                    .file_stem()
                    .and_then(|name| name.to_str())
                    .unwrap_or("");
                if stem == image_id {
                    fs::remove_file(path).map_err(|error| error.to_string())?;
                }
            }
        }
    }

    remove_image_from_manifest(&vault, &image_id)
}
