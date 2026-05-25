import { open } from "@tauri-apps/plugin-dialog";
import { DESKTOP_ONLY_MESSAGE, isTauriRuntime } from "./tauriRuntime.js";

export async function pickDirectory(
  title: string,
): Promise<string | null> {
  if (!isTauriRuntime()) {
    throw new Error(DESKTOP_ONLY_MESSAGE);
  }

  const selection = await open({
    directory: true,
    multiple: false,
    recursive: true,
    title,
  });

  if (selection === null || Array.isArray(selection)) {
    return null;
  }

  return selection;
}
