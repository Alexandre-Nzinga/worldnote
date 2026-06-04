import { invoke } from "@tauri-apps/api/core";
import { LinkSchema, type Link } from "@worldnote/shared";

export async function listLinks(vault: string): Promise<Link[]> {
  const raw = await invoke<unknown[]>("list_links", { vault });
  const links: Link[] = [];
  for (const item of raw) {
    const parsed = LinkSchema.safeParse(item);
    if (parsed.success) {
      links.push(parsed.data);
      continue;
    }
    console.warn("Skipping invalid link entry in vault:", parsed.error, item);
  }
  return links;
}
