import { Button, MaterialSymbol } from "@worldnote/ui";

type InspectorDeleteButtonProps = {
  isBusy?: boolean;
  isDeleting?: boolean;
  onDelete: () => void;
};

export function InspectorDeleteButton({
  isBusy = false,
  isDeleting = false,
  onDelete,
}: InspectorDeleteButtonProps) {
  return (
    <div className="flex justify-end">
      <Button variant="danger" size="sm" isDisabled={isBusy} onPress={onDelete}>
        <MaterialSymbol name="delete" className="text-base" />
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
