import type { Link } from "@worldnote/shared";

/** Linked card display names per socket on a card (empty when unwired). */
export function getSocketLinkLabels(
  cardId: string,
  links: Link[],
  getCardName: (cardId: string) => string | undefined,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const link of links) {
    if (link.source_card !== cardId) {
      continue;
    }
    const name = getCardName(link.target_card);
    if (!name) {
      continue;
    }
    const bucket = result[link.source_socket] ?? [];
    bucket.push(name);
    result[link.source_socket] = bucket;
  }
  return result;
}

export function formatSocketLinkValue(names: string[] | undefined): string {
  if (!names || names.length === 0) {
    return "";
  }
  return names.join(", ");
}
