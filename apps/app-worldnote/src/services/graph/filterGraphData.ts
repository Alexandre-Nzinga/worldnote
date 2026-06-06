import type { GraphData, GraphLink, GraphNode } from "./buildGraphData.js";

export type CanvasAttachmentRef = {
  id: string;
  label: string;
};

export type GraphFilterOptions = {
  searchQuery: string;
  /** When set, card nodes must be in this set (from SQLite index search). */
  searchCardIds?: ReadonlySet<string> | null;
  showAttachments: boolean;
  canvasCardsOnly: boolean;
  showOrphans: boolean;
  canvasCardIds: ReadonlySet<string>;
  canvasAttachments: readonly CanvasAttachmentRef[];
};

function linkDegree(links: GraphLink[]): Map<string, number> {
  const degree = new Map<string, number>();
  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
  }
  return degree;
}

function matchesSearch(node: GraphNode, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }
  if (node.label.toLowerCase().includes(normalizedQuery)) {
    return true;
  }
  return node.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
}

function attachmentNodes(
  attachments: readonly CanvasAttachmentRef[],
): GraphNode[] {
  return attachments.map((attachment) => ({
    id: attachment.id,
    label: attachment.label,
    kind: "attachment",
    tags: [],
  }));
}

/** Applies sidebar search and visibility filters to a built graph. */
export function filterGraphData(
  data: GraphData,
  options: GraphFilterOptions,
): GraphData {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();
  const degree = linkDegree(data.links);
  const mergedNodes = [
    ...data.nodes,
    ...(options.showAttachments
      ? attachmentNodes(options.canvasAttachments)
      : []),
  ];

  const nodes = mergedNodes.filter((node) => {
    if (normalizedQuery) {
      if (node.kind === "card" && options.searchCardIds) {
        if (!options.searchCardIds.has(node.id)) {
          return false;
        }
      } else if (!matchesSearch(node, normalizedQuery)) {
        return false;
      }
    }
    if (node.kind === "card" && options.canvasCardsOnly && !options.canvasCardIds.has(node.id)) {
      return false;
    }
    if (
      !options.showOrphans &&
      (degree.get(node.id) ?? 0) === 0 &&
      node.kind !== "attachment"
    ) {
      return false;
    }
    return true;
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = data.links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target),
  );

  return { nodes, links };
}
