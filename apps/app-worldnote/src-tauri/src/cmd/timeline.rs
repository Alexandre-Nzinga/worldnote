use serde::{Deserialize, Serialize};
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

fn sqlite_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join(".worldnote").join("index.db")
}

fn calendar_config_path(vault: &str) -> PathBuf {
    PathBuf::from(vault).join(".worldnote").join("calendar.json")
}

fn open_timeline_index(vault: &str) -> Result<SqliteIndex, String> {
    let index = SqliteIndex::open(sqlite_path(vault)).map_err(|error| error.to_string())?;
    index
        .ensure_timeline_synced(&eras_root(vault), &periods_root(vault))
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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarConfigPayload {
    #[serde(default)]
    pub suffix: String,
}

#[tauri::command]
pub fn list_eras(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let repo = JsonCardRepository::new(eras_root(&vault));
    let mut eras = Vec::new();
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(era) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            eras.push(era);
        }
    }
    eras.sort_by(|left, right| {
        let left_start = left.get("start_year").and_then(|value| value.as_i64()).unwrap_or(0);
        let right_start = right.get("start_year").and_then(|value| value.as_i64()).unwrap_or(0);
        left_start
            .cmp(&right_start)
            .then_with(|| {
                left.get("name")
                    .and_then(|value| value.as_str())
                    .unwrap_or_default()
                    .cmp(right.get("name").and_then(|value| value.as_str()).unwrap_or_default())
            })
    });
    Ok(eras)
}

#[tauri::command]
pub fn upsert_era(vault: String, era: serde_json::Value) -> Result<(), String> {
    let id = extract_str(&era, "id")?;
    let name = extract_str(&era, "name")?;
    let start_year = extract_i64(&era, "start_year")?;
    let end_year = extract_i64(&era, "end_year")?;

    fs::create_dir_all(eras_root(&vault)).map_err(|error| error.to_string())?;
    let repo = JsonCardRepository::new(eras_root(&vault));
    repo.upsert(&id, &era).map_err(|error| error.to_string())?;

    let index = open_timeline_index(&vault)?;
    index
        .upsert_era(&id, &name, start_year, end_year)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_era(vault: String, id: String) -> Result<(), String> {
    let repo = JsonCardRepository::new(eras_root(&vault));
    repo.delete(&id).map_err(|error| error.to_string())?;

    let index = open_timeline_index(&vault)?;
    index.delete_era(&id).map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_periods(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let repo = JsonCardRepository::new(periods_root(&vault));
    let mut periods = Vec::new();
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(period) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            periods.push(period);
        }
    }
    periods.sort_by(|left, right| {
        let left_start = left.get("start_year").and_then(|value| value.as_i64()).unwrap_or(0);
        let right_start = right.get("start_year").and_then(|value| value.as_i64()).unwrap_or(0);
        left_start
            .cmp(&right_start)
            .then_with(|| {
                left.get("name")
                    .and_then(|value| value.as_str())
                    .unwrap_or_default()
                    .cmp(right.get("name").and_then(|value| value.as_str()).unwrap_or_default())
            })
    });
    Ok(periods)
}

#[tauri::command]
pub fn upsert_period(vault: String, period: serde_json::Value) -> Result<(), String> {
    let id = extract_str(&period, "id")?;
    let name = extract_str(&period, "name")?;
    let start_year = extract_i64(&period, "start_year")?;
    let end_year = extract_i64(&period, "end_year")?;

    fs::create_dir_all(periods_root(&vault)).map_err(|error| error.to_string())?;
    let repo = JsonCardRepository::new(periods_root(&vault));
    repo.upsert(&id, &period)
        .map_err(|error| error.to_string())?;

    let index = open_timeline_index(&vault)?;
    index
        .upsert_period(&id, &name, start_year, end_year)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_period(vault: String, id: String) -> Result<(), String> {
    let repo = JsonCardRepository::new(periods_root(&vault));
    repo.delete(&id).map_err(|error| error.to_string())?;

    let index = open_timeline_index(&vault)?;
    index
        .delete_period(&id)
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
