import { RichEmptyState } from "../../ui/RichEmptyState.js";

type CanvasEmptyStateProps = {
  onAddCharacter: () => void;
  onAddLocation: () => void;
  onOpenWizard?: () => void;
  disabled?: boolean;
};

export function CanvasEmptyState({
  onAddCharacter,
  onAddLocation,
  onOpenWizard,
  disabled = false,
}: CanvasEmptyStateProps) {
  const actions = [
    {
      label: "Add Character",
      icon: "person",
      variant: "white" as const,
      onPress: onAddCharacter,
      isDisabled: disabled,
    },
    {
      label: "Add Location",
      icon: "location_on",
      variant: "secondary" as const,
      onPress: onAddLocation,
      isDisabled: disabled,
    },
    ...(onOpenWizard
      ? [
          {
            label: "WorldWizard",
            icon: "auto_awesome",
            variant: "secondary" as const,
            onPress: onOpenWizard,
            isDisabled: disabled,
          },
        ]
      : []),
  ];

  return (
    <RichEmptyState
      title="Your canvas is blank"
      description="Drop in your first card to start mapping characters, places, and the connections between them."
      actions={actions}
      className="pointer-events-auto max-w-lg shadow-lg"
    />
  );
}
