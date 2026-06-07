use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Component, Path, PathBuf};
use walkdir::WalkDir;
use worldnote_persistence::sqlite::SqliteIndex;
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

use super::link;
use super::vault::{summarize_world, world_display_name, world_paths, WorldSummary};

const EXPORT_FORMAT_VERSION: u32 = 1;
const EXPORT_MANIFEST_REL: &str = ".worldnote/export-manifest.json";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ExportManifest {
    format_version: u32,
    exported_at: String,
    app_version: String,
    world_name: String,
}

fn validate_world_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("World name is required".to_string());
    }
    if trimmed.contains('/') || trimmed.contains('\\') {
        return Err("World name cannot contain path separators".to_string());
    }
    Ok(trimmed)
}

fn should_skip_export_relative(relative: &Path) -> bool {
    let normalized = relative.to_string_lossy().replace('\\', "/");
    normalized == ".worldnote/index.db"
}

fn finalize_imported_world(world_path: &Path) -> Result<(), String> {
    let world_path_str = world_path.to_string_lossy().into_owned();
    link::migrate_legacy_bonds(&world_path_str)?;

    let (worldnote_dir, lore_dir, _, sqlite_path) = world_paths(world_path);
    if sqlite_path.exists() {
        fs::remove_file(&sqlite_path).map_err(|error| error.to_string())?;
    }

    let index = SqliteIndex::open(sqlite_path).map_err(|error| error.to_string())?;
    index
        .rebuild_from_lore(&lore_dir)
        .map_err(|error| error.to_string())?;
    index
        .rebuild_eras_from_json(&world_path.join("eras"))
        .map_err(|error| error.to_string())?;
    index
        .rebuild_periods_from_json(&world_path.join("periods"))
        .map_err(|error| error.to_string())?;

    let _ = worldnote_dir;
    Ok(())
}

fn validate_world_layout(world_path: &Path) -> Result<(), String> {
    let (worldnote_dir, lore_dir, manifest_path, _) = world_paths(world_path);
    if !worldnote_dir.join("world.json").is_file() {
        return Err("Archive is missing .worldnote/world.json".to_string());
    }
    if !lore_dir.is_dir() {
        return Err("Archive is missing lore/".to_string());
    }
    if !manifest_path.is_file() {
        return Err("Archive is missing canvas_manifest.json".to_string());
    }
    Ok(())
}

fn resolve_imported_world_root(extract_root: &Path) -> Result<PathBuf, String> {
    if extract_root.join("canvas_manifest.json").is_file() {
        validate_world_layout(extract_root)?;
        return Ok(extract_root.to_path_buf());
    }

    let mut child_dirs = vec![];
    for entry in fs::read_dir(extract_root).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        if entry.path().is_dir() {
            child_dirs.push(entry.path());
        }
    }

    if child_dirs.len() == 1 {
        let candidate = &child_dirs[0];
        if candidate.join("canvas_manifest.json").is_file() {
            validate_world_layout(candidate)?;
            return Ok(candidate.clone());
        }
    }

    Err("Archive does not contain a valid WorldNote world".to_string())
}

fn unique_world_directory(parent: &Path, preferred_name: &str) -> PathBuf {
    let base = parent.join(preferred_name);
    if !base.exists() {
        return base;
    }

    let imported = parent.join(format!("{preferred_name} (imported)"));
    if !imported.exists() {
        return imported;
    }

    for index in 2..100 {
        let candidate = parent.join(format!("{preferred_name} (imported {index})"));
        if !candidate.exists() {
            return candidate;
        }
    }

    parent.join(format!("{preferred_name} (imported {})", uuid::Uuid::new_v4()))
}

fn copy_dir_all(source: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination).map_err(|error| error.to_string())?;
    for entry in fs::read_dir(source).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let from = entry.path();
        let to = destination.join(entry.file_name());
        if from.is_dir() {
            copy_dir_all(&from, &to)?;
        } else {
            fs::copy(&from, &to).map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn extract_zip(archive_path: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination).map_err(|error| error.to_string())?;

    let file = File::open(archive_path).map_err(|error| error.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|error| error.to_string())?;

    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).map_err(|error| error.to_string())?;
        let Some(relative) = entry.enclosed_name().map(PathBuf::from) else {
            continue;
        };

        if relative
            .components()
            .any(|component| matches!(component, Component::ParentDir))
        {
            return Err("Archive contains invalid paths".to_string());
        }

        let out_path = destination.join(relative);
        if entry.is_dir() {
            fs::create_dir_all(&out_path).map_err(|error| error.to_string())?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }

        let mut output = File::create(&out_path).map_err(|error| error.to_string())?;
        std::io::copy(&mut entry, &mut output).map_err(|error| error.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn export_world(world_path: String, destination_path: String) -> Result<String, String> {
    let world_root = PathBuf::from(world_path.trim());
    if !world_root.is_dir() {
        return Err("World folder does not exist".to_string());
    }

    validate_world_layout(&world_root)?;

    let metadata_name = world_display_name(&world_root)?;
    let destination = PathBuf::from(destination_path.trim());
    if destination.as_os_str().is_empty() {
        return Err("Export destination is required".to_string());
    }
    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let exported_at = chrono_like_timestamp();
    let manifest = ExportManifest {
        format_version: EXPORT_FORMAT_VERSION,
        exported_at,
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        world_name: metadata_name,
    };
    let manifest_json =
        serde_json::to_string_pretty(&manifest).map_err(|error| error.to_string())?;

    let zip_file = File::create(&destination).map_err(|error| error.to_string())?;
    let mut writer = ZipWriter::new(zip_file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    writer
        .start_file(EXPORT_MANIFEST_REL, options)
        .map_err(|error| error.to_string())?;
    writer
        .write_all(manifest_json.as_bytes())
        .map_err(|error| error.to_string())?;

    for entry in WalkDir::new(&world_root).into_iter().filter_map(Result::ok) {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let relative = path
            .strip_prefix(&world_root)
            .map_err(|error| error.to_string())?;
        if should_skip_export_relative(relative) {
            continue;
        }

        let archive_name = relative.to_string_lossy().replace('\\', "/");
        if archive_name == EXPORT_MANIFEST_REL {
            continue;
        }

        writer
            .start_file(&archive_name, options)
            .map_err(|error| error.to_string())?;
        let mut input = File::open(path).map_err(|error| error.to_string())?;
        std::io::copy(&mut input, &mut writer).map_err(|error| error.to_string())?;
    }

    writer.finish().map_err(|error| error.to_string())?;
    Ok(destination.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn import_world(worldnote_root: String, archive_path: String) -> Result<WorldSummary, String> {
    let root = PathBuf::from(worldnote_root.trim());
    if !root.is_dir() {
        return Err("WorldNote folder does not exist".to_string());
    }

    let archive = PathBuf::from(archive_path.trim());
    if !archive.is_file() {
        return Err("Archive file does not exist".to_string());
    }

    let temp_root = std::env::temp_dir().join(format!(
        "worldnote-import-{}",
        uuid::Uuid::new_v4()
    ));
    extract_zip(&archive, &temp_root)?;

    let extracted_world = resolve_imported_world_root(&temp_root)?;
    let imported_name = world_display_name(&extracted_world)?;
    let preferred_name = validate_world_name(&imported_name)?;
    let destination = unique_world_directory(&root, preferred_name);

    if extracted_world == temp_root {
        fs::rename(&extracted_world, &destination).map_err(|error| error.to_string())?;
    } else {
        copy_dir_all(&extracted_world, &destination)?;
        let _ = fs::remove_dir_all(&temp_root);
    }

    finalize_imported_world(&destination)?;
    summarize_world(&destination)
}

fn chrono_like_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_string())
}
