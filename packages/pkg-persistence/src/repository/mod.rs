mod json_repo;

pub use json_repo::JsonCardRepository;

use crate::error::PersistenceError;
use serde_json::Value;

/// Repository abstraction — no raw SQL outside `sqlite/` index.
pub trait CardRepository: Send + Sync {
    fn find_by_id(&self, id: &str) -> Result<Option<Value>, PersistenceError>;
    fn list_ids(&self) -> Result<Vec<String>, PersistenceError>;
    fn upsert(&self, id: &str, payload: &Value) -> Result<(), PersistenceError>;
    fn delete(&self, id: &str) -> Result<(), PersistenceError>;
}
