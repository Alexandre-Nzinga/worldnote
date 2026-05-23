use std::path::PathBuf;
use worldnote_persistence::repository::{CardRepository, JsonCardRepository};
use worldnote_persistence::sqlite::SqliteIndex;

#[tauri::command]
pub fn upsert_card(vault: String, card: serde_json::Value) -> Result<(), String> {
    let vault_path = PathBuf::from(vault);
    let lore_root = vault_path.join("lore");
    let sqlite_path = vault_path.join(".worldnote").join("index.db");

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

    let repo = JsonCardRepository::new(lore_root);
    repo.upsert(id, &card).map_err(|error| error.to_string())?;

    let index = SqliteIndex::open(sqlite_path).map_err(|error| error.to_string())?;
    index
        .upsert(id, name, &tags)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_cards(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let lore_root = PathBuf::from(vault).join("lore");
    let repo = JsonCardRepository::new(lore_root);

    let mut cards = vec![];
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(card) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            cards.push(card);
        }
    }
    Ok(cards)
}
