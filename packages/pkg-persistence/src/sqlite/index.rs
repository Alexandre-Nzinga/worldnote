use crate::error::PersistenceError;
use rusqlite::{params, Connection};
use serde_json::Value;
use std::fs;
use std::path::Path;

/// Local SQLite index for search (metadata only; JSON is source of truth).
pub struct SqliteIndex {
    conn: Connection,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CardSearchHit {
    pub id: String,
    pub name: String,
    pub tags: Vec<String>,
    pub match_kind: String,
    pub match_detail: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimelineEntry {
    pub id: String,
    pub name: String,
    pub start_year: i64,
    pub end_year: i64,
}

impl SqliteIndex {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, PersistenceError> {
        let conn = Connection::open(path.as_ref())?;
        conn.execute_batch(
            r"
            CREATE TABLE IF NOT EXISTS cards (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              tags TEXT,
              lore TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS eras (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              start_year INTEGER NOT NULL,
              end_year INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS periods (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              start_year INTEGER NOT NULL,
              end_year INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS chronology (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              start_year INTEGER NOT NULL,
              end_year INTEGER NOT NULL
            );
            ",
        )?;
        Self::ensure_lore_column(&conn)?;
        Ok(Self { conn })
    }

    fn ensure_lore_column(conn: &Connection) -> Result<(), PersistenceError> {
        let has_lore = conn
            .prepare("SELECT lore FROM cards LIMIT 1")
            .is_ok();
        if has_lore {
            return Ok(());
        }
        conn.execute("ALTER TABLE cards ADD COLUMN lore TEXT NOT NULL DEFAULT ''", [])?;
        Ok(())
    }

    fn parse_tags_csv(tags_csv: &str) -> Vec<String> {
        if tags_csv.is_empty() {
            Vec::new()
        } else {
            tags_csv
                .split(',')
                .map(str::trim)
                .filter(|tag| !tag.is_empty())
                .map(str::to_owned)
                .collect()
        }
    }

    fn normalize_query(query: &str) -> String {
        let mut normalized = query.trim().to_lowercase();
        if normalized.starts_with("[[") {
            normalized = normalized[2..].to_string();
        }
        if normalized.ends_with("]]") {
            normalized.truncate(normalized.len().saturating_sub(2));
        }
        normalized.trim().to_string()
    }

    fn matching_tag(tags: &[String], query: &str) -> Option<String> {
        tags.iter()
            .find(|tag| tag.to_lowercase().contains(query))
            .cloned()
    }

    fn classify_hit(
        name: &str,
        tags: &[String],
        lore: &str,
        query: &str,
    ) -> (String, Option<String>) {
        let lower_name = name.to_lowercase();
        if lower_name.contains(query) {
            return ("name".to_string(), None);
        }
        if let Some(tag) = Self::matching_tag(tags, query) {
            return ("tag".to_string(), Some(tag));
        }
        if lore.to_lowercase().contains(query) {
            return ("lore".to_string(), None);
        }
        ("name".to_string(), None)
    }

    fn hit_score(match_kind: &str, name: &str, query: &str) -> i32 {
        let lower_name = name.to_lowercase();
        match match_kind {
            "name" if lower_name == query => 0,
            "name" if lower_name.starts_with(query) => 1,
            "name" => 2,
            "tag" => 3,
            _ => 4,
        }
    }

    /// Full-text search over indexed cards (name, tags, lore).
    pub fn search(&self, query: &str, limit: usize) -> Result<Vec<CardSearchHit>, PersistenceError> {
        let normalized = Self::normalize_query(query);
        let effective_limit = limit.max(1);

        if normalized.is_empty() {
            let rows = self.list_all()?;
            return Ok(rows
                .into_iter()
                .take(effective_limit)
                .map(|(id, name, tags)| CardSearchHit {
                    id,
                    name,
                    tags,
                    match_kind: "name".to_string(),
                    match_detail: None,
                })
                .collect());
        }

        let pattern = format!("%{normalized}%");
        let mut stmt = self.conn.prepare(
            "SELECT id, name, tags, lore
             FROM cards
             WHERE lower(name) LIKE ?1
                OR lower(tags) LIKE ?1
                OR lower(lore) LIKE ?1
             ORDER BY name COLLATE NOCASE",
        )?;

        let rows = stmt.query_map(params![pattern], |row| {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let tags_csv: String = row.get(2)?;
            let lore: String = row.get(3)?;
            Ok((id, name, Self::parse_tags_csv(&tags_csv), lore))
        })?;

        let mut hits = Vec::new();
        for row in rows {
            let (id, name, tags, lore) = row?;
            let (match_kind, match_detail) = Self::classify_hit(&name, &tags, &lore, &normalized);
            hits.push(CardSearchHit {
                id,
                name,
                tags,
                match_kind,
                match_detail,
            });
        }

        hits.sort_by(|left, right| {
            let score_left = Self::hit_score(&left.match_kind, &left.name, &normalized);
            let score_right = Self::hit_score(&right.match_kind, &right.name, &normalized);
            score_left
                .cmp(&score_right)
                .then_with(|| left.name.cmp(&right.name))
        });
        hits.truncate(effective_limit);
        Ok(hits)
    }

    pub fn upsert(
        &self,
        id: &str,
        name: &str,
        tags: &[String],
        lore: &str,
    ) -> Result<(), PersistenceError> {
        let tags_csv = tags.join(",");
        self.conn.execute(
            "INSERT OR REPLACE INTO cards (id, name, tags, lore) VALUES (?1, ?2, ?3, ?4)",
            (id, name, tags_csv, lore),
        )?;
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<(), PersistenceError> {
        self.conn
            .execute("DELETE FROM cards WHERE id = ?1", (id,))?;
        Ok(())
    }

    pub fn count(&self) -> Result<u32, PersistenceError> {
        let count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM cards", [], |row| row.get(0))?;
        Ok(count.max(0) as u32)
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
            Ok((id, name, Self::parse_tags_csv(&tags_csv)))
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(PersistenceError::from)
    }

    /// Rebuild the search index from lore JSON files (source of truth).
    pub fn rebuild_from_lore(&self, lore_dir: &Path) -> Result<u32, PersistenceError> {
        if !lore_dir.is_dir() {
            self.conn.execute("DELETE FROM cards", [])?;
            return Ok(0);
        }

        let tx = self.conn.unchecked_transaction()?;
        tx.execute("DELETE FROM cards", [])?;

        let mut indexed = 0u32;
        for entry in fs::read_dir(lore_dir)? {
            let entry = entry?;
            let path = entry.path();
            if !path
                .extension()
                .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
            {
                continue;
            }

            let raw = fs::read_to_string(&path)?;
            let card: Value = serde_json::from_str(&raw)?;
            let Some(id) = card.get("id").and_then(Value::as_str) else {
                continue;
            };
            let Some(name) = card.get("name").and_then(Value::as_str) else {
                continue;
            };
            let tags = card
                .get("tags")
                .and_then(Value::as_array)
                .map(|array| {
                    array
                        .iter()
                        .filter_map(|item| item.as_str().map(str::to_owned))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let lore = card
                .get("lore")
                .and_then(Value::as_str)
                .unwrap_or_default();

            tx.execute(
                "INSERT INTO cards (id, name, tags, lore) VALUES (?1, ?2, ?3, ?4)",
                (id, name, tags.join(","), lore),
            )?;
            indexed += 1;
        }

        tx.commit()?;
        Ok(indexed)
    }

    /// Rebuild when the index is empty but lore files exist.
    pub fn ensure_synced(&self, lore_dir: &Path) -> Result<(), PersistenceError> {
        if self.count()? > 0 {
            return Ok(());
        }
        if !lore_dir.is_dir() {
            return Ok(());
        }
        let lore_count = fs::read_dir(lore_dir)?
            .filter_map(Result::ok)
            .filter(|entry| {
                entry
                    .path()
                    .extension()
                    .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
            })
            .count();
        if lore_count > 0 {
            self.rebuild_from_lore(lore_dir)?;
        }
        Ok(())
    }

    pub fn upsert_era(
        &self,
        id: &str,
        name: &str,
        start_year: i64,
        end_year: i64,
    ) -> Result<(), PersistenceError> {
        self.conn.execute(
            "INSERT OR REPLACE INTO eras (id, name, start_year, end_year) VALUES (?1, ?2, ?3, ?4)",
            (id, name, start_year, end_year),
        )?;
        Ok(())
    }

    pub fn delete_era(&self, id: &str) -> Result<(), PersistenceError> {
        self.conn
            .execute("DELETE FROM eras WHERE id = ?1", (id,))?;
        Ok(())
    }

    pub fn list_eras(&self) -> Result<Vec<TimelineEntry>, PersistenceError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, start_year, end_year FROM eras ORDER BY start_year, name COLLATE NOCASE",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(TimelineEntry {
                id: row.get(0)?,
                name: row.get(1)?,
                start_year: row.get(2)?,
                end_year: row.get(3)?,
            })
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(PersistenceError::from)
    }

    pub fn upsert_period(
        &self,
        id: &str,
        name: &str,
        start_year: i64,
        end_year: i64,
    ) -> Result<(), PersistenceError> {
        self.conn.execute(
            "INSERT OR REPLACE INTO periods (id, name, start_year, end_year) VALUES (?1, ?2, ?3, ?4)",
            (id, name, start_year, end_year),
        )?;
        Ok(())
    }

    pub fn delete_period(&self, id: &str) -> Result<(), PersistenceError> {
        self.conn
            .execute("DELETE FROM periods WHERE id = ?1", (id,))?;
        Ok(())
    }

    pub fn list_periods(&self) -> Result<Vec<TimelineEntry>, PersistenceError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, start_year, end_year FROM periods ORDER BY start_year, name COLLATE NOCASE",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(TimelineEntry {
                id: row.get(0)?,
                name: row.get(1)?,
                start_year: row.get(2)?,
                end_year: row.get(3)?,
            })
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(PersistenceError::from)
    }

    pub fn upsert_chronology(
        &self,
        id: &str,
        name: &str,
        start_year: i64,
        end_year: i64,
    ) -> Result<(), PersistenceError> {
        self.conn.execute(
            "INSERT OR REPLACE INTO chronology (id, name, start_year, end_year) VALUES (?1, ?2, ?3, ?4)",
            (id, name, start_year, end_year),
        )?;
        Ok(())
    }

    pub fn delete_chronology(&self, id: &str) -> Result<(), PersistenceError> {
        self.conn
            .execute("DELETE FROM chronology WHERE id = ?1", (id,))?;
        self.conn
            .execute("DELETE FROM eras WHERE id = ?1", (id,))?;
        self.conn
            .execute("DELETE FROM periods WHERE id = ?1", (id,))?;
        Ok(())
    }

    pub fn list_chronology(&self) -> Result<Vec<TimelineEntry>, PersistenceError> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, start_year, end_year FROM chronology ORDER BY start_year, name COLLATE NOCASE",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(TimelineEntry {
                id: row.get(0)?,
                name: row.get(1)?,
                start_year: row.get(2)?,
                end_year: row.get(3)?,
            })
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(PersistenceError::from)
    }

    fn rebuild_timeline_table(
        conn: &Connection,
        table: &str,
        json_dir: &Path,
    ) -> Result<u32, PersistenceError> {
        if !json_dir.is_dir() {
            conn.execute(&format!("DELETE FROM {table}"), [])?;
            return Ok(0);
        }

        let tx = conn.unchecked_transaction()?;
        tx.execute(&format!("DELETE FROM {table}"), [])?;

        let mut indexed = 0u32;
        for entry in fs::read_dir(json_dir)? {
            let entry = entry?;
            let path = entry.path();
            if !path
                .extension()
                .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
            {
                continue;
            }

            let raw = fs::read_to_string(&path)?;
            let payload: Value = serde_json::from_str(&raw)?;
            let Some(id) = payload.get("id").and_then(Value::as_str) else {
                continue;
            };
            let Some(name) = payload.get("name").and_then(Value::as_str) else {
                continue;
            };
            let Some(start_year) = payload.get("start_year").and_then(Value::as_i64) else {
                continue;
            };
            let Some(end_year) = payload.get("end_year").and_then(Value::as_i64) else {
                continue;
            };

            tx.execute(
                &format!(
                    "INSERT INTO {table} (id, name, start_year, end_year) VALUES (?1, ?2, ?3, ?4)"
                ),
                (id, name, start_year, end_year),
            )?;
            indexed += 1;
        }

        tx.commit()?;
        Ok(indexed)
    }

    pub fn rebuild_eras_from_json(&self, eras_dir: &Path) -> Result<u32, PersistenceError> {
        Self::rebuild_timeline_table(&self.conn, "eras", eras_dir)
    }

    pub fn rebuild_chronology_from_json(
        &self,
        chronology_dir: &Path,
    ) -> Result<u32, PersistenceError> {
        Self::rebuild_timeline_table(&self.conn, "chronology", chronology_dir)
    }

    pub fn rebuild_periods_from_json(&self, periods_dir: &Path) -> Result<u32, PersistenceError> {
        Self::rebuild_timeline_table(&self.conn, "periods", periods_dir)
    }

    pub fn ensure_timeline_synced(
        &self,
        eras_dir: &Path,
        periods_dir: &Path,
        chronology_dir: &Path,
    ) -> Result<(), PersistenceError> {
        let era_count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM eras", [], |row| row.get(0))?;
        if era_count == 0 && eras_dir.is_dir() {
            let json_count = fs::read_dir(eras_dir)?
                .filter_map(Result::ok)
                .filter(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
                })
                .count();
            if json_count > 0 {
                self.rebuild_eras_from_json(eras_dir)?;
            }
        }

        let period_count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM periods", [], |row| row.get(0))?;
        if period_count == 0 && periods_dir.is_dir() {
            let json_count = fs::read_dir(periods_dir)?
                .filter_map(Result::ok)
                .filter(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
                })
                .count();
            if json_count > 0 {
                self.rebuild_periods_from_json(periods_dir)?;
            }
        }

        let chronology_count: i64 = self
            .conn
            .query_row("SELECT COUNT(*) FROM chronology", [], |row| row.get(0))?;
        if chronology_count == 0 && chronology_dir.is_dir() {
            let json_count = fs::read_dir(chronology_dir)?
                .filter_map(Result::ok)
                .filter(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext.to_string_lossy().eq_ignore_ascii_case("json"))
                })
                .count();
            if json_count > 0 {
                self.rebuild_chronology_from_json(chronology_dir)?;
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn temp_db() -> (tempfile::TempDir, PathBuf) {
        let dir = tempfile::tempdir().expect("tempdir");
        let path = dir.path().join("index.db");
        (dir, path)
    }

    #[test]
    fn search_matches_name_tag_and_lore() {
        let (_dir, path) = temp_db();
        let index = SqliteIndex::open(&path).expect("open");
        index
            .upsert(
                "00000000-0000-4000-8000-000000000001",
                "Paul Atreides",
                &["kwisatz-haderach".to_string()],
                "",
            )
            .expect("upsert paul");
        index
            .upsert(
                "00000000-0000-4000-8000-000000000002",
                "Lady Jessica",
                &[],
                "Mentor on Caladan.",
            )
            .expect("upsert jessica");

        let name_hits = index.search("paul", 20).expect("search name");
        assert_eq!(name_hits.len(), 1);
        assert_eq!(name_hits[0].match_kind, "name");

        let tag_hits = index.search("kwisatz", 20).expect("search tag");
        assert_eq!(tag_hits.len(), 1);
        assert_eq!(tag_hits[0].match_kind, "tag");
        assert_eq!(tag_hits[0].match_detail.as_deref(), Some("kwisatz-haderach"));

        let lore_hits = index.search("caladan", 20).expect("search lore");
        assert_eq!(lore_hits.len(), 1);
        assert_eq!(lore_hits[0].match_kind, "lore");
    }

    #[test]
    fn rebuild_from_lore_populates_index() {
        let dir = tempfile::tempdir().expect("tempdir");
        let lore_dir = dir.path().join("lore");
        fs::create_dir_all(&lore_dir).expect("lore dir");
        fs::write(
            lore_dir.join("00000000-0000-4000-8000-000000000099.json"),
            r#"{"id":"00000000-0000-4000-8000-000000000099","name":"Arrakis","tags":["desert"],"lore":"The spice must flow."}"#,
        )
        .expect("write lore");

        let index = SqliteIndex::open(dir.path().join("index.db")).expect("open");
        let indexed = index.rebuild_from_lore(&lore_dir).expect("rebuild");
        assert_eq!(indexed, 1);

        let hits = index.search("spice", 20).expect("search");
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].name, "Arrakis");
    }
}
