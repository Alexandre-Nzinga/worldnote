use crate::error::PersistenceError;
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;

/// Watches lore directory for external edits.
pub struct LoreWatcher {
    _watcher: RecommendedWatcher,
}

impl LoreWatcher {
    pub fn start(lore_root: impl AsRef<Path>) -> Result<Self, PersistenceError> {
        let mut watcher = RecommendedWatcher::new(
            |res: notify::Result<Event>| {
                if let Err(e) = res {
                    eprintln!("worldnote_persistence: notify error: {e}");
                }
            },
            notify::Config::default(),
        )?;
        watcher.watch(lore_root.as_ref(), RecursiveMode::Recursive)?;
        Ok(Self { _watcher: watcher })
    }
}
