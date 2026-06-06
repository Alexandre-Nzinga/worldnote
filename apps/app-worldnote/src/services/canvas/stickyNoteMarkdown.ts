import { invoke } from "@tauri-apps/api/core";
import { trackPersist } from "../../hooks/useSaveStatus.js";

export type StickyNoteMarkdownEntry = {
  id: string;
  content: string;
};

export async function writeStickyNoteMarkdown(
  vault: string,
  id: string,
  markdown: string,
): Promise<void> {
  return trackPersist(async () => {
    await invoke("write_sticky_note_markdown", { vault, id, markdown });
  });
}

export async function listStickyNoteMarkdown(
  vault: string,
): Promise<StickyNoteMarkdownEntry[]> {
  return invoke<StickyNoteMarkdownEntry[]>("list_sticky_note_markdown", {
    vault,
  });
}

/** Returns an empty list when the command is unavailable (e.g. Tauri not rebuilt). */
export async function listStickyNoteMarkdownSafe(
  vault: string,
): Promise<StickyNoteMarkdownEntry[]> {
  try {
    return await listStickyNoteMarkdown(vault);
  } catch (error) {
    console.warn(
      "Could not load sticky note markdown files; cards will still load. Restart the Tauri dev app if sticky notes are missing:",
      error,
    );
    return [];
  }
}

export async function deleteStickyNoteMarkdown(
  vault: string,
  id: string,
): Promise<void> {
  return trackPersist(async () => {
    await invoke("delete_sticky_note_markdown", { vault, id });
  });
}

/** Serialize heading + body into a single markdown file. */
export function serializeStickyNoteMarkdown(
  heading: string | undefined,
  content: string,
): string {
  const trimmedHeading = heading?.trim();
  const trimmedContent = content.trim();
  if (trimmedHeading) {
    const body = trimmedContent ? `\n\n${trimmedContent}` : "";
    return `# ${trimmedHeading}${body}`;
  }
  return content;
}

/** Parse a sticky note markdown file into heading + body. */
export function parseStickyNoteMarkdown(markdown: string): {
  heading?: string;
  content: string;
} {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return { content: "" };
  }

  const lines = trimmed.split("\n");
  const firstLine = lines[0]?.trim() ?? "";
  const headingMatch = firstLine.match(/^#\s+(.+)$/);
  if (!headingMatch) {
    return { content: trimmed };
  }

  const heading = headingMatch[1]?.trim();
  const rest = lines.slice(1).join("\n").trim();
  return {
    heading: heading || undefined,
    content: rest,
  };
}

/** First non-empty line of markdown (for card description summaries). */
export function descriptionSummaryFromMarkdown(
  markdown: string,
): string | undefined {
  const lines = markdown.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const withoutHeading = trimmed.replace(/^#+\s+/, "");
    if (withoutHeading) {
      return withoutHeading;
    }
  }
  return undefined;
}
