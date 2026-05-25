import { invoke } from "@tauri-apps/api/core";
import { LinkSchema, type Link } from "@worldnote/shared";

export async function listLinks(vault: string): Promise<Link[]> {
  const raw = await invoke<unknown[]>("list_links", { vault });
  return raw.map((item) => LinkSchema.parse(item));
}
