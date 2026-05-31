use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const SETTINGS_FILE: &str = "settings.json";
const WORLDNOTE_FOLDER_NAME: &str = "WorldNote";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub username: String,
    pub worldnote_root: String,
    pub onboarded_at: u64,
    #[serde(default)]
    pub visible_sockets: HashMap<String, HashMap<String, bool>>,
    /// Home-only; world folder paths (max 3 enforced in the app).
    #[serde(default)]
    pub pinned_world_paths: Vec<String>,
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;
    Ok(config_dir.join(SETTINGS_FILE))
}

#[tauri::command]
pub fn get_settings(app: tauri::AppHandle) -> Result<Option<AppSettings>, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    let settings: AppSettings = serde_json::from_str(&contents).map_err(|error| error.to_string())?;

    if settings.username.trim().is_empty() || settings.worldnote_root.trim().is_empty() {
        return Ok(None);
    }

    Ok(Some(settings))
}

#[tauri::command]
pub fn save_settings(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    if settings.username.trim().is_empty() {
        return Err("Username is required".to_string());
    }
    if settings.worldnote_root.trim().is_empty() {
        return Err("WorldNote root path is required".to_string());
    }

    let path = settings_path(&app)?;
    let json = serde_json::to_string_pretty(&settings).map_err(|error| error.to_string())?;
    let temp_path = path.with_extension("json.tmp");

    fs::write(&temp_path, json).map_err(|error| error.to_string())?;
    fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn ensure_worldnote_root(parent: String) -> Result<String, String> {
    let parent_path = PathBuf::from(parent.trim());
    if parent_path.as_os_str().is_empty() {
        return Err("Parent directory is required".to_string());
    }

    let worldnote_root = parent_path.join(WORLDNOTE_FOLDER_NAME);
    fs::create_dir_all(&worldnote_root).map_err(|error| error.to_string())?;
    Ok(worldnote_root.to_string_lossy().into_owned())
}
