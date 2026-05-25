/** Sockets that auto-create a related character when dropped on the empty canvas. */
export const AUTO_CREATE_CHARACTER_SOCKETS = new Set([
  "mother",
  "father",
  "issue",
]);

export function contextualCharacterName(
  socketId: string,
  sourceCardName: string,
): string {
  const trimmed = sourceCardName.trim() || "Unknown";
  switch (socketId) {
    case "mother":
      return `Mother of ${trimmed}`;
    case "father":
      return `Father of ${trimmed}`;
    case "issue":
      return `Child of ${trimmed}`;
    default:
      return "New Character";
  }
}
