use std::path::{Path, PathBuf};

use tauri::Manager;

/// Allow a directory tree in the Tauri asset protocol scope so `convertFileSrc`
/// can serve images from user world folders (including `.worldnote/assets/`).
pub fn allow_directory_in_asset_scope(app: &tauri::AppHandle, path: &Path) {
    if path.as_os_str().is_empty() {
        return;
    }
    let _ = app.asset_protocol_scope().allow_directory(path, true);
}

pub fn allow_worldnote_root(app: &tauri::AppHandle, worldnote_root: &str) {
    let trimmed = worldnote_root.trim();
    if trimmed.is_empty() {
        return;
    }
    let root = PathBuf::from(trimmed);
    if root.is_dir() {
        allow_directory_in_asset_scope(app, &root);
    }
}

pub fn restore_saved_worldnote_asset_scope(app: &tauri::AppHandle) {
    let path = match settings_path(app) {
        Ok(path) => path,
        Err(_) => return,
    };
    if !path.is_file() {
        return;
    }

    let contents = match std::fs::read_to_string(&path) {
        Ok(contents) => contents,
        Err(_) => return,
    };

    let settings: super::settings::AppSettings = match serde_json::from_str(&contents) {
        Ok(settings) => settings,
        Err(_) => return,
    };

    allow_worldnote_root(app, &settings.worldnote_root);
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;
    Ok(config_dir.join("settings.json"))
}
