use super::CardRepository;
use crate::error::PersistenceError;
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

/// JSON file-backed repository over a `lore/` directory (stub).
pub struct JsonCardRepository {
    lore_root: PathBuf,
}

impl JsonCardRepository {
    pub fn new(lore_root: impl AsRef<Path>) -> Self {
        Self {
            lore_root: lore_root.as_ref().to_path_buf(),
        }
    }

    fn path_for(&self, id: &str) -> PathBuf {
        self.lore_root.join(format!("{id}.json"))
    }
}

impl CardRepository for JsonCardRepository {
    fn find_by_id(&self, id: &str) -> Result<Option<Value>, PersistenceError> {
        let path = self.path_for(id);
        if !path.exists() {
            return Ok(None);
        }
        let raw = fs::read_to_string(path)?;
        let payload = serde_json::from_str(&raw)?;
        Ok(Some(payload))
    }

    fn list_ids(&self) -> Result<Vec<String>, PersistenceError> {
        if !self.lore_root.exists() {
            return Ok(vec![]);
        }

        let mut ids = vec![];
        for entry in fs::read_dir(&self.lore_root)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
                continue;
            }
            if let Some(stem) = path.file_stem().and_then(|name| name.to_str()) {
                ids.push(stem.to_string());
            }
        }
        Ok(ids)
    }

    fn upsert(&self, id: &str, payload: &Value) -> Result<(), PersistenceError> {
        fs::create_dir_all(&self.lore_root)?;
        let path = self.path_for(id);
        let pretty = serde_json::to_string_pretty(payload)?;
        fs::write(path, pretty)?;
        Ok(())
    }

    fn delete(&self, id: &str) -> Result<(), PersistenceError> {
        let path = self.path_for(id);
        if path.exists() {
            fs::remove_file(path)?;
        }
        Ok(())
    }
}
