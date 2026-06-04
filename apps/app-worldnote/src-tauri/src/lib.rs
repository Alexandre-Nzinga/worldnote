mod cmd;

fn prevent_default_plugin() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    use tauri_plugin_prevent_default::Flags;

    // Block browser chrome (context menu, print, navigation, …) but not keyboard
    // shortcuts — canvas copy/paste/undo are handled in the webview.
    let flags = Flags::all().difference(Flags::keyboard());

    #[cfg(debug_assertions)]
    {
        // Keep F12 devtools and reload in dev.
        return tauri_plugin_prevent_default::Builder::new()
            .with_flags(flags.difference(Flags::debug()))
            .build();
    }

    #[cfg(not(debug_assertions))]
    {
        tauri_plugin_prevent_default::Builder::new()
            .with_flags(flags)
            .build()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(prevent_default_plugin())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .register_uri_scheme_protocol("worldnote", |_ctx, request| {
            let _path = request.uri().path();
            http::Response::builder()
                .status(http::StatusCode::NOT_FOUND)
                .body(Vec::new())
                .unwrap()
        })
        .invoke_handler(tauri::generate_handler![
            cmd::settings::get_settings,
            cmd::settings::save_settings,
            cmd::settings::ensure_worldnote_root,
            cmd::vault::open_world,
            cmd::vault::create_world,
            cmd::vault::list_worlds,
            cmd::vault::save_world_cover,
            cmd::vault::rename_world,
            cmd::vault::delete_world,
            cmd::library::list_all_cards,
            cmd::library::copy_card_to_world,
            cmd::card::list_card_index,
            cmd::card::list_cards,
            cmd::card::upsert_card,
            cmd::card::duplicate_card,
            cmd::card::delete_card,
            cmd::card::save_card_image,
            cmd::card::add_card_lore_image,
            cmd::canvas_image::save_canvas_image,
            cmd::canvas_image::save_canvas_image_bytes,
            cmd::canvas_image::delete_canvas_image,
            cmd::link::upsert_link,
            cmd::link::list_links,
            cmd::link::delete_link,
            cmd::manifest::load_canvas_manifest,
            cmd::manifest::update_canvas_manifest,
            cmd::manifest::update_canvas_manifest_node,
            cmd::manifest::remove_canvas_manifest_node,
            cmd::manifest::update_canvas_manifest_image,
            cmd::manifest::remove_canvas_manifest_image,
            cmd::manifest::update_canvas_manifest_sticky_note,
            cmd::manifest::remove_canvas_manifest_sticky_note,
            cmd::sticky_note::write_sticky_note_markdown,
            cmd::sticky_note::list_sticky_note_markdown,
            cmd::sticky_note::delete_sticky_note_markdown,
            cmd::wizard::ollama_health,
            cmd::wizard::ollama_list_models,
            cmd::wizard::ollama_chat,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
