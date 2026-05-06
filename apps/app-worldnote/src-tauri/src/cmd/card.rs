#[tauri::command]
pub fn list_cards_stub() -> Result<Vec<String>, String> {
    Ok(vec![])
}

#[tauri::command]
pub fn save_card_stub(id: String, payload: serde_json::Value) -> Result<(), String> {
    let _ = (id, payload);
    Ok(())
}
