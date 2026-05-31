import { Textarea } from "@heroui/react";
import { inspectorTextareaClassNames } from "./inspectorFieldStyles.js";
import { MarkdownView } from "./MarkdownView.js";

type LoreTabProps = {
  readOnly: boolean;
  lore: string;
  onLoreChange: (value: string) => void;
};

export function LoreTab({ readOnly, lore, onLoreChange }: LoreTabProps) {
  if (readOnly) {
    return <MarkdownView content={lore} />;
  }

  return (
    <Textarea
      id="inspector-lore"
      minRows={10}
      placeholder="Write lore in markdown…"
      value={lore}
      onValueChange={onLoreChange}
      variant="flat"
      classNames={inspectorTextareaClassNames}
    />
  );
}
