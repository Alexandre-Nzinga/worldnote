//! WorldNote persistence layer — JSON lore + SQLite index.

pub mod error;
pub mod json_io;
pub mod repository;
pub mod sqlite;

pub use error::PersistenceError;
