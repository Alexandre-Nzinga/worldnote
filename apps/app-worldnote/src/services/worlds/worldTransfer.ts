import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { DESKTOP_ONLY_MESSAGE, isTauriRuntime } from "../desktop/tauriRuntime.js";

const WORLD_ARCHIVE_EXTENSION = "worldnote.zip";

function archiveSafeWorldName(name: string): string {
  const sanitized = name
    .trim()
    .replace(/[^\w\s-]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return sanitized.length > 0 ? sanitized : "world";
}

export async function pickWorldArchiveFile(): Promise<string | null> {
  if (!isTauriRuntime()) {
    throw new Error(DESKTOP_ONLY_MESSAGE);
  }

  const selection = await open({
    multiple: false,
    filters: [
      {
        name: "WorldNote world",
        extensions: [WORLD_ARCHIVE_EXTENSION, "zip"],
      },
    ],
    title: "Choose a world archive to import",
  });

  if (selection === null || Array.isArray(selection)) {
    return null;
  }

  return selection;
}

export async function pickWorldExportDestination(
  worldName: string,
): Promise<string | null> {
  if (!isTauriRuntime()) {
    throw new Error(DESKTOP_ONLY_MESSAGE);
  }

  const selection = await save({
    filters: [
      {
        name: "WorldNote world",
        extensions: [WORLD_ARCHIVE_EXTENSION],
      },
    ],
    defaultPath: `${archiveSafeWorldName(worldName)}.${WORLD_ARCHIVE_EXTENSION}`,
    title: "Export world",
  });

  if (selection === null) {
    return null;
  }

  return selection.endsWith(`.${WORLD_ARCHIVE_EXTENSION}`)
    ? selection
    : `${selection}.${WORLD_ARCHIVE_EXTENSION}`;
}

export async function exportWorld(
  worldPath: string,
  destinationPath: string,
): Promise<string> {
  return invoke<string>("export_world", { worldPath, destinationPath });
}

export async function importWorld(
  worldnoteRoot: string,
  archivePath: string,
): Promise<import("./listWorlds.js").WorldSummary> {
  return invoke("import_world", { worldnoteRoot, archivePath });
}
