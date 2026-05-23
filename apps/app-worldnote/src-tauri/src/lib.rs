mod cmd;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .register_uri_scheme_protocol("worldnote", |_ctx, request| {
            let _path = request.uri().path();
            http::Response::builder()
                .status(http::StatusCode::NOT_FOUND)
                .body(Vec::new())
                .unwrap()
        })
        .invoke_handler(tauri::generate_handler![
            cmd::vault::open_world,
            cmd::vault::create_world,
            cmd::card::list_cards,
            cmd::card::upsert_card,
            cmd::manifest::load_canvas_manifest,
            cmd::manifest::update_canvas_manifest,
            cmd::manifest::update_canvas_manifest_node,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
