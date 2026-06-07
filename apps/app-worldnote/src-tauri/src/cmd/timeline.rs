use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use worldnote_persistence::repository::{CardRepository, JsonCardRepository};
use worldnote_persistence::sqlite::SqliteIndex;

fn eras_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("eras")
}

fn periods_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("periods")
}

fn chronology_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("chronology")
}

fn sqlite_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join(".worldnote").join("index.db")
}

fn calendar_config_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join(".worldnote").join("calendar.json")
}

fn open_timeline_index(vault: &str) -> Result<SqliteIndex, String> {
    let index = SqliteIndex::open(sqlite_path(vault)).map_err(|error| error.to_string())?;
    index
        .ensure_timeline_synced(
            &eras_root(vault),
            &periods_root(vault),
            &chronology_root(vault),
        )
        .map_err(|error| error.to_string())?;
    Ok(index)
}

fn extract_i64(value: &serde_json::Value, field: &str) -> Result<i64, String> {
    value
        .get(field)
        .and_then(|entry| entry.as_i64())
        .ok_or_else(|| format!("Payload is missing required integer '{field}'"))
}

fn extract_str(value: &serde_json::Value, field: &str) -> Result<String, String> {
    value
        .get(field)
        .and_then(|entry| entry.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("Payload is missing required '{field}'"))
}

fn normalize_chronology_entry(entry: serde_json::Value) -> serde_json::Value {
    let Some(object) = entry.as_object().cloned() else {
        return entry;
    };

    let mut normalized = object;
    normalized.remove("parent_kind");
    serde_json::Value::Object(normalized)
}

fn sort_chronology(entries: &mut [serde_json::Value]) {
    entries.sort_by(|left, right| {
        let left_start = left
            .get("start_year")
            .and_then(|value| value.as_i64())
            .unwrap_or(0);
        let right_start = right
            .get("start_year")
            .and_then(|value| value.as_i64())
            .unwrap_or(0);
        left_start
            .cmp(&right_start)
            .then_with(|| {
                left.get("name")
                    .and_then(|value| value.as_str())
                    .unwrap_or_default()
                    .cmp(right.get("name").and_then(|value| value.as_str()).unwrap_or_default())
            })
    });
}

fn load_chronology_from_repo(
    repo: &JsonCardRepository,
    merged: &mut HashMap<String, serde_json::Value>,
) -> Result<(), String> {
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(entry) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            merged.insert(id, normalize_chronology_entry(entry));
        }
    }
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarConfigPayload {
    #[serde(default)]
    pub suffix: String,
}

#[tauri::command]
pub fn list_chronology(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let mut merged = HashMap::new();

    load_chronology_from_repo(&JsonCardRepository::new(eras_root(&vault)), &mut merged)?;
    load_chronology_from_repo(&JsonCardRepository::new(periods_root(&vault)), &mut merged)?;
    load_chronology_from_repo(&JsonCardRepository::new(chronology_root(&vault)), &mut merged)?;

    let mut entries: Vec<serde_json::Value> = merged.into_values().collect();
    sort_chronology(&mut entries);
    Ok(entries)
}

#[tauri::command]
pub fn upsert_chronology(vault: String, entry: serde_json::Value) -> Result<(), String> {
    let normalized = normalize_chronology_entry(entry);
    let id = extract_str(&normalized, "id")?;
    let name = extract_str(&normalized, "name")?;
    let start_year = extract_i64(&normalized, "start_year")?;
    let end_year = extract_i64(&normalized, "end_year")?;

    fs::create_dir_all(chronology_root(&vault)).map_err(|error| error.to_string())?;
    let repo = JsonCardRepository::new(chronology_root(&vault));
    repo.upsert(&id, &normalized)
        .map_err(|error| error.to_string())?;

    let index = open_timeline_index(&vault)?;
    index
        .upsert_chronology(&id, &name, start_year, end_year)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_chronology(vault: String, id: String) -> Result<(), String> {
    for root in [
        eras_root(&vault),
        periods_root(&vault),
        chronology_root(&vault),
    ] {
        let repo = JsonCardRepository::new(root);
        let _ = repo.delete(&id);
    }

    let index = open_timeline_index(&vault)?;
    index
        .delete_chronology(&id)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_calendar_config(vault: String) -> Result<CalendarConfigPayload, String> {
    let path = calendar_config_path(&vault);
    if !path.exists() {
        return Ok(CalendarConfigPayload {
            suffix: String::new(),
        });
    }
    let raw = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    serde_json::from_str(&raw).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_calendar_config(vault: String, config: CalendarConfigPayload) -> Result<(), String> {
    let worldnote_dir = PathBuf::from(&vault).join(".worldnote");
    fs::create_dir_all(&worldnote_dir).map_err(|error| error.to_string())?;
    let json = serde_json::to_string_pretty(&config).map_err(|error| error.to_string())?;
    fs::write(calendar_config_path(&vault), json).map_err(|error| error.to_string())?;
    Ok(())
}
