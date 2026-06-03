import { isTauriRuntime } from "../services/desktop/tauriRuntime.js";

/**
 * Fallback when the native webview context menu is not disabled at the platform
 * layer (e.g. browser `pnpm dev:web`). The Tauri app uses
 * `tauri-plugin-prevent-default` in Rust for the real fix.
 */
export function installNativeContextMenuGuard(): void {
  if (!isTauriRuntime()) {
    return;
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
    },
    { capture: true },
  );
}
