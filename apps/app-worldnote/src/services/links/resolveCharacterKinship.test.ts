import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import {
  findTargetSocketForPluggedCard,
  reciprocalKinshipLink,
  resolveCharacterKinshipSocket,
} from "./resolveCharacterKinship.js";

function character(id: string, name: string, gender?: "male" | "female") {
  return {
    id,
    name,
    card_type: "character" as const,
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
    gender,
  };
}

function link(
  sourceCard: string,
  sourceSocket: string,
  targetCard: string,
): Link {
  return {
    id: crypto.randomUUID(),
    source_card: sourceCard,
    source_socket: sourceSocket,
    target_card: targetCard,
  };
}

const paulId = "00000000-0000-4000-8000-000000000001";
const letoId = "00000000-0000-4000-8000-000000000002";

describe("resolveCharacterKinshipSocket", () => {
  it("uses issue on parent when child is dropped on parent card", () => {
    const paul = character(paulId, "Paul Atreides");
    const leto = character(letoId, "Leto Atreides", "male");
    expect(resolveCharacterKinshipSocket(leto, paul, [])).toBe("issue");
  });

  it("uses issue on parent when child already has father link to parent", () => {
    const paul = character(paulId, "Paul Atreides");
    const leto = character(letoId, "Leto Atreides", "male");
    const links = [link(paulId, "father", letoId)];
    expect(resolveCharacterKinshipSocket(leto, paul, links)).toBe("issue");
  });

  it("does not pick mother before issue for child-on-parent drop", () => {
    const paul = character(paulId, "Paul Atreides");
    const leto = character(letoId, "Leto Atreides", "male");
    expect(findTargetSocketForPluggedCard(leto, paul, [])).toBe("issue");
  });
});

describe("reciprocalKinshipLink", () => {
  it("mirrors father on child to issue on parent", () => {
    const paul = character(paulId, "Paul");
    const leto = character(letoId, "Leto", "male");
    expect(reciprocalKinshipLink(paul, "father", leto)).toEqual({
      sourceCard: leto,
      sourceSocket: "issue",
      targetCard: paul,
    });
  });
});
