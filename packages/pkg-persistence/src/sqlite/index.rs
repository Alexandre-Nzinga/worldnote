use crate::error::PersistenceError;
use rusqlite::Connection;
use std::path::Path;

/// Local SQLite index for search (metadata only; JSON is source of truth).
pub struct SqliteIndex {
    conn: Connection,
}

impl SqliteIndex {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, PersistenceError> {
        let conn = Connection::open(path.as_ref())?;
        conn.execute_batch(
            r"
            CREATE TABLE IF NOT EXISTS cards (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              tags TEXT
            );
            ",
        )?;
        Ok(Self { conn })
    }

    /// Stub: full-text search over indexed cards.
    pub fn search(&self, _query: &str) -> Result<Vec<String>, PersistenceError> {
        let _ = &self.conn;
        Ok(vec![])
    }

    pub fn upsert(&self, id: &str, name: &str, tags: &[String]) -> Result<(), PersistenceError> {
        let tags_csv = tags.join(",");
        self.conn.execute(
            "INSERT OR REPLACE INTO cards (id, name, tags) VALUES (?1, ?2, ?3)",
            (id, name, tags_csv),
        )?;
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<(), PersistenceError> {
        self.conn
            .execute("DELETE FROM cards WHERE id = ?1", (id,))?;
        Ok(())
    }

    /// All indexed cards (id, name, tags), sorted by name.
    pub fn list_all(&self) -> Result<Vec<(String, String, Vec<String>)>, PersistenceError> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, tags FROM cards ORDER BY name COLLATE NOCASE")?;
        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let tags_csv: String = row.get(2)?;
            let tags = if tags_csv.is_empty() {
                Vec::new()
            } else {
                tags_csv
                    .split(',')
                    .map(str::trim)
                    .filter(|tag| !tag.is_empty())
                    .map(str::to_owned)
                    .collect()
            };
            Ok((id, name, tags))
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(PersistenceError::from)
    }
}
