import { RichEmptyState } from "../../ui/RichEmptyState.js";

type LoreEmptyStateProps = {
  onStartWriting?: () => void;
  compact?: boolean;
};

export function LoreEmptyState({
  onStartWriting,
  compact = true,
}: LoreEmptyStateProps) {
  return (
    <RichEmptyState
      compact={compact}
      title="No lore yet"
      description="Write backstory, history, and notes that bring this card to life."
      actions={
        onStartWriting
          ? [
              {
                label: "Write lore",
                icon: "edit",
                variant: "white" as const,
                onPress: onStartWriting,
              },
            ]
          : []
      }
      className="w-full"
    />
  );
}
