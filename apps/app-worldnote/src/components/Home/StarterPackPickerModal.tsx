import {
  AnimatedModal,
  Button,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import {
  STARTER_PACKS,
  type StarterPack,
} from "../../services/starterPacks/index.js";

type StarterPackPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (pack: StarterPack) => void;
  isBusy?: boolean;
};

export function StarterPackPickerModal({
  isOpen,
  onClose,
  onSelectPack,
  isBusy = false,
}: StarterPackPickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isBusy, isOpen, onClose]);

  const handleConfirm = useCallback(() => {
    const pack = STARTER_PACKS.find((entry) => entry.id === selectedId);
    if (!pack) {
      return;
    }
    onSelectPack(pack);
  }, [onSelectPack, selectedId]);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={isBusy}
      labelledBy="starter-pack-picker-title"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="starter-pack-picker-title"
          {...getHeadingProps("h5", { tone: "inverse", weight: "semibold" })}
        >
          Starter packs
        </h2>
        <p style={getBodyTextStyle("small")}>
          Pre-built worlds with characters, places, lore, and links — ready to
          explore or customize.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {STARTER_PACKS.map((pack) => {
          const isSelected = selectedId === pack.id;
          return (
            <li key={pack.id}>
              <button
                type="button"
                disabled={isBusy}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedId(pack.id);
                }}
                className={`flex w-full items-start gap-4 rounded-wn-card border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-wn-mono-500 bg-wn-surface-raised"
                    : "border-wn-mono-800 bg-wn-mono-950/20 hover:border-wn-mono-700 hover:bg-wn-mono-950/40"
                } ${isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wn-mono-900">
                  <MaterialSymbol
                    name={pack.icon}
                    className="text-2xl text-wn-mono-300"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    {...getHeadingProps("h6", {
                      tone: "inverse",
                      weight: "medium",
                      className: "truncate",
                    })}
                  >
                    {pack.name}
                  </span>
                  <span
                    className="text-wn-mono-400"
                    style={getBodyTextStyle("small")}
                  >
                    {pack.description}
                  </span>
                  <span
                    className="text-wn-mono-500"
                    style={getBodyTextStyle("small")}
                  >
                    {pack.cards.length} cards · {pack.links.length} links
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="base"
          isDisabled={isBusy}
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="white"
          size="base"
          isDisabled={!selectedId || isBusy}
          onPress={handleConfirm}
        >
          {isBusy ? "Building…" : "Open pack"}
        </Button>
      </footer>
    </AnimatedModal>
  );
}
