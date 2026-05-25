import { useMemo, useState } from "react";
import { RemixIcon } from "./RemixIcon.js";

export type CreateOption = "character" | "location";
export type CanvasTool = "select" | "link" | "text" | "actions";

type CreateMenuOption = CreateOption | "note" | "bond" | "group";

type CanvasToolbarProps = {
  className?: string;
  vaultLabel?: string;
  onBack?: () => void;
  onCreate?: (type: CreateOption) => void;
};

const primaryTools: {
  id: CanvasTool;
  label: string;
  icon: string;
}[] = [
  { id: "select", label: "Select", icon: "ri-cursor-line" },
  { id: "link", label: "Link", icon: "ri-link" },
  { id: "text", label: "Text", icon: "ri-text" },
  { id: "actions", label: "Actions", icon: "ri-function-add-line" },
];

const createMenuItems: {
  id: CreateMenuOption;
  label: string;
  description: string;
  disabled?: boolean;
  icon: string;
}[] = [
  {
    id: "character",
    label: "Character",
    description: "Create a character card",
    icon: "ri-user-line",
  },
  {
    id: "location",
    label: "Location",
    description: "Create a location card",
    icon: "ri-map-pin-line",
  },
  {
    id: "note",
    label: "Note",
    description: "Coming soon",
    icon: "ri-sticky-note-line",
    disabled: true,
  },
  {
    id: "bond",
    label: "Bond",
    description: "Coming soon",
    icon: "ri-links-line",
    disabled: true,
  },
  {
    id: "group",
    label: "Group",
    description: "Coming soon",
    icon: "ri-group-line",
    disabled: true,
  },
];

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  emphasis?: boolean;
  onPress?: () => void;
  icon: string;
};

function ToolbarButton({
  label,
  isActive = false,
  isDisabled = false,
  emphasis = false,
  onPress,
  icon,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={onPress}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
        emphasis
          ? "bg-wn-mono-600 text-wn-mono-950 hover:bg-wn-mono-500 disabled:opacity-40"
          : isActive
            ? "bg-wn-mono-700 text-wn-mono-50"
            : "text-wn-mono-300 hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:opacity-40"
      }`}
    >
      <RemixIcon name={icon} />
    </button>
  );
}

export function CanvasToolbar({
  className,
  vaultLabel,
  onBack,
  onCreate,
}: CanvasToolbarProps) {
  const isCreateOption = (id: CreateMenuOption): id is CreateOption =>
    id === "character" || id === "location";

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [linkHintVisible, setLinkHintVisible] = useState(false);

  const supportsCreate = useMemo(() => !!onCreate, [onCreate]);

  const handleToolPress = (tool: CanvasTool) => {
    if (tool === "select" || tool === "link") {
      setActiveTool(tool);
      setLinkHintVisible(tool === "link");
      return;
    }
  };

  const handleSelectCreateOption = (option: CreateOption) => {
    setCreateMenuOpen(false);
    onCreate?.(option);
  };

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 px-4 ${className ?? ""}`}
    >
      {linkHintVisible ? (
        <p className="pointer-events-auto w-max max-w-[min(90vw,20rem)] rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-3 py-2 text-center text-xs text-wn-mono-300 shadow-lg">
          Show sockets on a card in the editor, then drag from a card&apos;s
          right output into a socket on the left.
        </p>
      ) : null}

      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-wn-mono-800 bg-wn-mono-900 p-1.5 shadow-lg">
        <div className="flex items-center gap-0.5">
          {primaryTools.map((item) => {
            const isActive = activeTool === item.id;
            const isImplemented = item.id === "select" || item.id === "link";
            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                isDisabled={!isImplemented}
                onPress={() => handleToolPress(item.id)}
              />
            );
          })}
        </div>

        <div className="mx-1 h-7 w-px bg-wn-mono-700" aria-hidden />

        <div className="relative flex items-center gap-0.5">
          <ToolbarButton
            label={vaultLabel ? `Vault: ${vaultLabel}` : "Vault"}
            icon="ri-stack-line"
            emphasis
            onPress={onBack}
          />

          <ToolbarButton
            label="Create card"
            icon="ri-add-line"
            emphasis
            isDisabled={!supportsCreate}
            onPress={() => setCreateMenuOpen((open) => !open)}
          />

          {createMenuOpen ? (
            <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-2 shadow-lg">
              <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-wn-mono-500">
                Create card
              </div>
              {createMenuItems.map((item) => {
                const createOption: CreateOption | null = isCreateOption(item.id)
                  ? item.id
                  : null;
                if (!createOption) {
                  return null;
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="mb-1 flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-left text-wn-mono-200 hover:border-wn-mono-700 hover:bg-wn-mono-800"
                    onClick={() => handleSelectCreateOption(createOption)}
                  >
                    <span className="text-wn-mono-400">
                      <RemixIcon name={item.icon} className="text-[16px]" />
                    </span>
                    <span className="flex flex-col items-start leading-tight">
                      <span className="text-[12px] font-medium text-wn-mono-100">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-wn-mono-500">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
