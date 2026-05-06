#[tauri::command]
pub fn open_world_folder(path: String) -> Result<String, String> {
    Ok(path)
}

#[tauri::command]
pub fn create_world_stub(root: String) -> Result<String, String> {
    Ok(format!("World stub at {root}"))
}
