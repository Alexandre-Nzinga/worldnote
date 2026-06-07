import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import { buildGraphData } from "./buildGraphData.js";
import { filterGraphData } from "./filterGraphData.js";

function stubCard(
  id: string,
  name: string,
  options?: { tags?: string[]; image_path?: string },
): WorldCard {
  return {
    id,
    name,
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: options?.tags ?? [],
    image_path: options?.image_path,
    card_type: "character",
  } as unknown as WorldCard;
}

function stubLink(
  sourceCard: string,
  targetCard: string,
  sourceSocket = "spouse",
): Link {
  return {
    id: `${sourceCard}-${targetCard}`,
    source_card: sourceCard,
    source_socket: sourceSocket,
    target_card: targetCard,
  };
}

describe("filterGraphData", () => {
  const linkedA = stubCard("a", "Aria", { tags: ["hero"] });
  const linkedB = stubCard("b", "Marcus");
  const orphan = stubCard("c", "Lonely");
  const withCardImage = stubCard("d", "Portrait", { image_path: "img.png" });
  const offCanvas = stubCard("e", "Hidden");

  const base = buildGraphData(
    [linkedA, linkedB, orphan, withCardImage, offCanvas],
    [stubLink(linkedA.id, linkedB.id)],
  );

  const canvasAttachments = [
    { id: "img-1", label: "map.png" },
    { id: "img-2", label: "sketch.jpg" },
  ];

  it("filters by search query across names and tags", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "hero",
      showAttachments: true,
      canvasCardsOnly: false,
      showOrphans: true,
      canvasCardIds: new Set(),
      canvasAttachments,
    });

    expect(filtered.nodes.map((node) => node.id)).toEqual([linkedA.id]);
  });

  it("filters card nodes by SQLite search id set", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "aria",
      searchCardIds: new Set([linkedA.id]),
      showAttachments: true,
      canvasCardsOnly: false,
      showOrphans: true,
      canvasCardIds: new Set(),
      canvasAttachments,
    });

    expect(filtered.nodes.map((node) => node.id)).toEqual([linkedA.id]);
  });

  it("includes canvas image-tool uploads when showAttachments is true", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "",
      showAttachments: true,
      canvasCardsOnly: false,
      showOrphans: true,
      canvasCardIds: new Set(),
      canvasAttachments,
    });

    expect(filtered.nodes.some((node) => node.id === "img-1")).toBe(true);
    expect(filtered.nodes.some((node) => node.kind === "attachment")).toBe(
      true,
    );
  });

  it("hides canvas image-tool uploads when showAttachments is false", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "",
      showAttachments: false,
      canvasCardsOnly: false,
      showOrphans: true,
      canvasCardIds: new Set(),
      canvasAttachments,
    });

    expect(filtered.nodes.some((node) => node.kind === "attachment")).toBe(
      false,
    );
    expect(filtered.nodes.some((node) => node.id === withCardImage.id)).toBe(
      true,
    );
  });

  it("limits to canvas cards when canvasCardsOnly is true", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "",
      showAttachments: true,
      canvasCardsOnly: true,
      showOrphans: true,
      canvasCardIds: new Set([linkedA.id, linkedB.id, orphan.id]),
      canvasAttachments,
    });

    expect(filtered.nodes.map((node) => node.id).sort()).toEqual(
      ["a", "b", "c", "img-1", "img-2"].sort(),
    );
  });

  it("hides orphan card nodes when showOrphans is false", () => {
    const filtered = filterGraphData(base, {
      searchQuery: "",
      showAttachments: true,
      canvasCardsOnly: false,
      showOrphans: false,
      canvasCardIds: new Set(),
      canvasAttachments,
    });

    expect(filtered.nodes.some((node) => node.id === orphan.id)).toBe(false);
    expect(filtered.nodes.some((node) => node.id === linkedA.id)).toBe(true);
    expect(filtered.nodes.some((node) => node.id === "img-1")).toBe(true);
  });
});
