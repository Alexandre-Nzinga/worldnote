import type { CanvasFlowNode } from "@worldnote/canvas";
import type { Node } from "@xyflow/react";
import type { WorldCard } from "@worldnote/shared";

export const CANVAS_PASTE_OFFSET_PX = 48;

/** Node count at which React Flow viewport culling is enabled. */
export const CANVAS_VIRTUALIZE_NODE_THRESHOLD = 40;

export function selectedCardIdsFromNodes(
  nodeList: CanvasFlowNode[],
  cards: Record<string, WorldCard>,
): string[] {
  return nodeList
    .filter(
      (node) =>
        node.type === "worldnoteCard" && node.selected && cards[node.id] != null,
    )
    .map((node) => node.id);
}

export function selectedImageIdsFromNodes(
  nodeList: CanvasFlowNode[],
): string[] {
  return nodeList
    .filter((node) => node.type === "worldnoteImage" && node.selected)
    .map((node) => node.id);
}

export function isSelectableCanvasNode(
  node: Node,
  cardsById: Record<string, WorldCard>,
): boolean {
  return (
    (node.type === "worldnoteCard" && cardsById[node.id] != null) ||
    node.type === "worldnoteImage" ||
    node.type === "worldnoteNote"
  );
}

export function cardsRecord(cards: WorldCard[]): Record<string, WorldCard> {
  return Object.fromEntries(cards.map((card) => [card.id, card]));
}

export function linksRecord<T extends { id: string }>(
  links: T[],
): Record<string, T> {
  return Object.fromEntries(links.map((link) => [link.id, link]));
}

export function worldNameFromPath(vaultPath: string): string {
  const folder = vaultPath.split(/[/\\]/).pop();
  return folder ?? "World";
}
