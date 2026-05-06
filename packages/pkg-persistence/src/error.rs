use thiserror::Error;

#[derive(Debug, Error)]
pub enum PersistenceError {
    #[error("io: {0}")]
    Io(#[from] std::io::Error),

    #[error("json: {0}")]
    Json(#[from] serde_json::Error),

    #[error("sqlite: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("notify: {0}")]
    Notify(#[from] notify::Error),

    #[error("{0}")]
    Other(String),
}
