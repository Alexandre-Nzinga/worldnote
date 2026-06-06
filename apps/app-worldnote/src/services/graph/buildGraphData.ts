import type { Link, WorldCard } from "@worldnote/shared";

export type GraphNodeKind = "card" | "attachment";

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  cardType?: WorldCard["card_type"];
  tags: string[];
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  socket: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

/** Maps all world cards and socket links into force-graph nodes and edges. */
export function buildGraphData(
  cards: WorldCard[],
  links: Link[],
): GraphData {
  const cardIds = new Set(cards.map((card) => card.id));

  const nodes: GraphNode[] = cards.map((card) => ({
    id: card.id,
    label: card.name,
    kind: "card",
    cardType: card.card_type,
    tags: card.tags,
  }));

  const graphLinks: GraphLink[] = [];
  for (const link of links) {
    if (!cardIds.has(link.source_card) || !cardIds.has(link.target_card)) {
      continue;
    }
    graphLinks.push({
      id: link.id,
      source: link.source_card,
      target: link.target_card,
      socket: link.source_socket,
    });
  }

  return { nodes, links: graphLinks };
}
