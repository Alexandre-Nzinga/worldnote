import { ActionMenu, MaterialSymbol } from "@worldnote/ui";
import { inspectorMoreMenuTriggerClassName } from "./inspectorFieldStyles.js";

type InspectorCardMoreMenuProps = {
  disabled?: boolean;
  onViewJson: () => void;
};

export function InspectorCardMoreMenu({
  disabled,
  onViewJson,
}: InspectorCardMoreMenuProps) {
  return (
    <ActionMenu
      ariaLabel="Card actions"
      placement="bottom-end"
      onAction={(key) => {
        if (key === "json") {
          onViewJson();
        }
      }}
      items={[
        {
          id: "json",
          label: "JSON",
          icon: <MaterialSymbol name="data_object" className="text-[20px]" />,
        },
      ]}
      trigger={
        <button
          type="button"
          className={inspectorMoreMenuTriggerClassName}
          disabled={disabled}
          aria-label="More card actions"
        >
          <MaterialSymbol name="more_vert" className="text-[18px]" />
        </button>
      }
    />
  );
}
