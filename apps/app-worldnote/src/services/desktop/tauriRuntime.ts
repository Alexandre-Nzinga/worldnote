/** True when running inside the WorldNote Tauri desktop webview (not a plain browser tab). */
export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  // Do not use import.meta.env.TAURI_* — those are compile-time and true in browser too.
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

export const DESKTOP_ONLY_MESSAGE =
  "Folder picking only works in the WorldNote desktop app window not in a browser tab. Use the app window that opened when you ran the dev server.";
