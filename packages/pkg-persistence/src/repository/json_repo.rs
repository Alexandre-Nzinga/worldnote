use super::CardRepository;
use crate::error::PersistenceError;
use serde_json::Value;
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
    fn find_by_id(&self, _id: &str) -> Result<Option<Value>, PersistenceError> {
        let _path = self.path_for(_id);
        // Stub: implement read + parse in MVP
        Ok(None)
    }

    fn list_ids(&self) -> Result<Vec<String>, PersistenceError> {
        let _ = &self.lore_root;
        Ok(vec![])
    }

    fn upsert(&self, _id: &str, _payload: &Value) -> Result<(), PersistenceError> {
        // Stub: atomic write + debounce in json_io
        Ok(())
    }

    fn delete(&self, _id: &str) -> Result<(), PersistenceError> {
        Ok(())
    }
}
