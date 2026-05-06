mod watcher;

pub use watcher::LoreWatcher;

use std::path::Path;
use std::time::Duration;
use tokio::time::sleep;

/// Debounced disk writer hook placeholder coordinator.
pub struct DebouncedWriter {
    debounce: Duration,
}

impl DebouncedWriter {
    pub fn new(debounce: Duration) -> Self {
        Self { debounce }
    }

    /// Schedules a write after debounce (stub: only sleeps).
    pub async fn schedule_write(&self, path: impl AsRef<Path>) {
        let _ = path.as_ref();
        sleep(self.debounce).await;
    }
}

impl Default for DebouncedWriter {
    fn default() -> Self {
        Self {
            debounce: Duration::from_millis(200),
        }
    }
}
