import { RichEmptyState } from "../ui/RichEmptyState.js";

type EmptyWorldsStateProps = {
  onTrySampleWorld: () => void;
  disabled?: boolean;
};

export function EmptyWorldsState({
  onTrySampleWorld,
  disabled,
}: EmptyWorldsStateProps) {
  return (
    <RichEmptyState
      title="No worlds yet"
      description="Click on 'Create world' to start building your own world, or explore a sample world to get started."
      actions={[
        {
          label: "Try sample world",
          icon: "globe",
          variant: "white",
          onPress: onTrySampleWorld,
          isDisabled: disabled,
        },
      ]}
      className="min-h-[270px] justify-center"
    />
  );
}
