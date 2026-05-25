import type { LinkEdgeData } from "@worldnote/canvas";
import type { Link } from "@worldnote/shared";
import type { Edge } from "@xyflow/react";

/** Visual edge: from plugged-in card (target_card) to socket owner (source_card). */
export function linkToEdge(link: Link): Edge<LinkEdgeData> {
  return {
    id: link.id,
    source: link.target_card,
    target: link.source_card,
    targetHandle: link.source_socket,
    type: "link",
    data: { sourceSocket: link.source_socket },
  };
}
