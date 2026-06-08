import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import {
  SUBTITLE_GENERATION_HINT,
  TIMELINE_YEAR_GENERATION_HINT,
} from "@worldnote/shared";
import { buildFillGapsPrompt } from "./expandPrompts.js";

function planet(id: string, name: string): WorldCard {
  return {
    id,
    name,
    card_type: "planet",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
  };
}

describe("buildFillGapsPrompt", () => {
  it("includes short-subtitle guidance when generating subtitle", () => {
    const prompt = buildFillGapsPrompt(
      planet("00000000-0000-4000-8000-000000000001", "Arrakis"),
      ["subtitle"],
    );
    expect(prompt).toContain("Field guidance:");
    expect(prompt).toContain(SUBTITLE_GENERATION_HINT);
  });

  it("includes timeline year guidance when generating birth year", () => {
    const prompt = buildFillGapsPrompt(
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Leto Atreides",
        card_type: "character",
        parent_id: null,
        position: { x: 0, y: 0 },
        tags: [],
        custom_properties: {},
        gender: "male",
      },
      ["start_year", "end_year"],
    );
    expect(prompt).toContain(TIMELINE_YEAR_GENERATION_HINT);
  });
});
