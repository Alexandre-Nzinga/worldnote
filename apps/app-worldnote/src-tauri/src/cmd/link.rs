use std::path::PathBuf;
use worldnote_persistence::repository::{CardRepository, JsonCardRepository};

fn links_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("links")
}

fn bonds_root(vault: &str) -> PathBuf {
    PathBuf::from(vault).join("bonds")
}

/// Remove all links whose source or target card matches `card_id`.
pub(crate) fn delete_links_referencing_card(vault: &str, card_id: &str) -> Result<(), String> {
    let repo = JsonCardRepository::new(links_root(vault));
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        let Some(link) = repo.find_by_id(&id).map_err(|error| error.to_string())? else {
            continue;
        };
        let references_card = link
            .get("source_card")
            .and_then(|value| value.as_str())
            .is_some_and(|source| source == card_id)
            || link
                .get("target_card")
                .and_then(|value| value.as_str())
                .is_some_and(|target| target == card_id);
        if references_card {
            repo.delete(&id).map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn upsert_link(vault: String, link: serde_json::Value) -> Result<(), String> {
    let id = link
        .get("id")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "Link payload is missing required 'id'".to_string())?;
    let source_card = link
        .get("source_card")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "Link payload is missing required 'source_card'".to_string())?;
    let source_socket = link
        .get("source_socket")
        .and_then(|value| value.as_str())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "Link payload is missing required 'source_socket'".to_string())?;
    let target_card = link
        .get("target_card")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "Link payload is missing required 'target_card'".to_string())?;
    if source_card == target_card {
        return Err("A link cannot connect a card to itself".to_string());
    }
    let _ = source_socket;

    let repo = JsonCardRepository::new(links_root(&vault));
    repo.upsert(id, &link).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_links(vault: String) -> Result<Vec<serde_json::Value>, String> {
    let bonds_dir = bonds_root(&vault);
    if bonds_dir.exists() {
        eprintln!(
            "Warning: legacy bonds/ folder detected in vault; migrate or remove it. Using links/ only."
        );
    }

    let repo = JsonCardRepository::new(links_root(&vault));

    let mut links = vec![];
    for id in repo.list_ids().map_err(|error| error.to_string())? {
        if let Some(link) = repo.find_by_id(&id).map_err(|error| error.to_string())? {
            links.push(link);
        }
    }
    Ok(links)
}

#[tauri::command]
pub fn delete_link(vault: String, id: String) -> Result<(), String> {
    let repo = JsonCardRepository::new(links_root(&vault));
    repo.delete(&id).map_err(|error| error.to_string())
}
