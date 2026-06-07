use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const SETTINGS_FILE: &str = "settings.json";
const WORLDNOTE_FOLDER_NAME: &str = "WorldNote";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct KeyboardShortcut {
    pub key: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ctrl: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub meta: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shift: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub alt: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CanvasKeyboardShortcuts {
    #[serde(default)]
    pub copy: KeyboardShortcut,
    #[serde(default)]
    pub paste: KeyboardShortcut,
    #[serde(default)]
    pub duplicate: KeyboardShortcut,
    #[serde(default)]
    pub cut: KeyboardShortcut,
    #[serde(default)]
    pub select_all: KeyboardShortcut,
    #[serde(default)]
    pub delete: KeyboardShortcut,
    #[serde(default)]
    pub undo: KeyboardShortcut,
    #[serde(default)]
    pub redo: KeyboardShortcut,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardTypeBadgeOverride {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub badge_class_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub badge_text_color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WizardQuickCommandAvailability {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min_cards: Option<u32>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub require_types: HashMap<String, u32>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub require_any_of: Vec<HashMap<String, u32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WizardQuickCommand {
    pub id: String,
    pub label: String,
    pub icon: String,
    pub kind: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target_card_type: Option<String>,
    pub prompt_template: String,
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub built_in: bool,
    #[serde(default)]
    pub availability: WizardQuickCommandAvailability,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WizardSettings {
    #[serde(default)]
    pub host: String,
    #[serde(default)]
    pub default_model: String,
    /// Optional author instructions appended to the WorldWizard system prompt.
    #[serde(default)]
    pub guidelines: String,
    #[serde(default)]
    pub quick_commands: Vec<WizardQuickCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ModulesSettings {
    #[serde(default)]
    pub enabled: Vec<String>,
}

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
    /// Local LLM (Ollama) connection config for the WorldWizard.
    #[serde(default)]
    pub wizard: Option<WizardSettings>,
    /// Appearance preference: "light", "dark", or "system". Defaults to "system".
    #[serde(default)]
    pub theme: Option<String>,
    /// Accent color token for primary CTAs (e.g. "azure-500"). Defaults to "mono-50".
    #[serde(default)]
    pub primary_color: Option<String>,
    /// Profile avatar gradient preset (e.g. "mono"). Defaults to "mono".
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub avatar_color: Option<String>,
    /// Canvas copy / paste / duplicate shortcuts.
    #[serde(default)]
    pub canvas_shortcuts: Option<CanvasKeyboardShortcuts>,
    /// Per card-type badge color overrides.
    #[serde(default)]
    pub card_type_badge_colors: HashMap<String, CardTypeBadgeOverride>,
    /// Family Tree kinship label pill color overrides.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kinship_label_colors: Option<CardTypeBadgeOverride>,
    /// Measurement display: "metric" or "imperial". Stored values remain metric.
    #[serde(default)]
    pub unit_system: Option<String>,
    /// Enabled feature modules.
    #[serde(default)]
    pub modules: Option<ModulesSettings>,
    /// Family Tree: "hide" or "dim" unrelated characters when anchor is selected.
    #[serde(default)]
    pub family_tree_unrelated_mode: Option<String>,
    /// Timeline: suffix appended to year labels (e.g. "AG" → "10191 AG").
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeline_era_suffix: Option<String>,
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
