import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauriRuntime } from "./tauriRuntime.js";

/** Open a URL in the system browser (Tauri) or a new tab (Vite dev). */
export async function openExternalUrl(url: string): Promise<void> {
  if (isTauriRuntime()) {
    await openUrl(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
