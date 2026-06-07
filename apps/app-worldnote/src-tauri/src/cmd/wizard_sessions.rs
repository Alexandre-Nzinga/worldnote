use std::fs;
use std::path::PathBuf;

fn sessions_path(vault: &str) -> PathBuf {
    PathBuf::from(vault)
        .join(".worldnote")
        .join("wizard-sessions.json")
}

fn default_store() -> serde_json::Value {
    serde_json::json!({
        "version": 1,
        "activeSessionId": null,
        "sessions": []
    })
}

#[tauri::command]
pub fn load_wizard_sessions(vault: String) -> Result<serde_json::Value, String> {
    let path = sessions_path(&vault);
    if !path.exists() {
        return Ok(default_store());
    }
    let raw = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    serde_json::from_str(&raw).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_wizard_sessions(vault: String, store: serde_json::Value) -> Result<(), String> {
    let worldnote_dir = PathBuf::from(&vault).join(".worldnote");
    fs::create_dir_all(&worldnote_dir).map_err(|error| error.to_string())?;
    let json = serde_json::to_string_pretty(&store).map_err(|error| error.to_string())?;
    fs::write(sessions_path(&vault), json).map_err(|error| error.to_string())?;
    Ok(())
}
