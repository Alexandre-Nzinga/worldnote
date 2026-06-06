import type { WorldCard } from "@worldnote/shared";
import { stripLeadingLoreHeading } from "./inspectorLoreMarkdown.js";
import {
  typeFieldsFromCard,
  type TypeSpecificEditorState,
} from "../card-editor/cardEditorTypes.js";

export type InspectorFieldState = {
  name: string;
  subtitle: string;
  lore: string;
  tags: string[];
  typeFields: TypeSpecificEditorState;
};

/** Maps a generated/patched card onto inspector local edit state. */
export function applyWizardCardToInspector(
  card: WorldCard,
): InspectorFieldState {
  return {
    name: card.name,
    subtitle: card.subtitle ?? "",
    lore: stripLeadingLoreHeading(card.lore ?? ""),
    tags: card.tags,
    typeFields: typeFieldsFromCard(card),
  };
}
