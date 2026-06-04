import { invoke } from "@tauri-apps/api/core";

export type WorldSummary = {
  path: string;
  name: string;
  description: string;
  cardCount: number;
  lastEdited: number;
  coverImage?: string;
};

export async function listWorlds(root: string): Promise<WorldSummary[]> {
  return invoke<WorldSummary[]>("list_worlds", { root });
}
