import { AnimatedPanel, Button, getHeadingProps } from "@worldnote/ui";
import type { Link } from "@worldnote/shared";
import { useCallback, useRef, useState } from "react";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";
import { usePanelHotkeys } from "./usePanelHotkeys.js";

function formatSocketId(socketId: string): string {
  return socketId.replace(/_/g, " ");
}

const panelClassName =
  "pointer-events-auto absolute right-4 top-4 z-30 flex max-h-[calc(100vh-7rem)] w-[min(100%,22rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

type LinkEditorPanelProps = {
  isOpen: boolean;
  link: Link | undefined;
  sourceCardName: string;
  targetCardName: string;
  onClose: () => void;
  onDelete: (linkId: string) => Promise<void>;
};

export function LinkEditorPanel({
  isOpen,
  link,
  sourceCardName,
  targetCardName,
  onClose,
  onDelete,
}: LinkEditorPanelProps) {
  const lastLinkRef = useRef<Link | undefined>(undefined);
  if (link) {
    lastLinkRef.current = link;
  }
  const activeLink = link ?? lastLinkRef.current;

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!activeLink) {
      return;
    }
    if (
      !window.confirm(
        `Remove link from "${formatSocketId(activeLink.source_socket)}" on ${sourceCardName}?`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(activeLink.id);
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : String(deleteError),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [activeLink, onClose, onDelete, sourceCardName]);

  usePanelHotkeys({
    enabled: isOpen && !isDeleting,
    onEscape: onClose,
    onDelete: () => {
      void handleDelete();
    },
  });

  if (!activeLink) {
    return null;
  }

  return (
    <AnimatedPanel isOpen={isOpen} className={panelClassName}>
      <header className="flex items-start justify-between gap-3 border-b border-wn-mono-800 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-wn-mono-500">
            Link
          </p>
          <h2 {...getHeadingProps("h6", { tone: "inverse", weight: "semibold" })}>
            Socket wire
          </h2>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm text-wn-mono-400 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
          onClick={onClose}
          disabled={isDeleting}
        >
          Close
        </button>
      </header>

      <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className={modalFieldLabelClassName}>Socket</span>
            <p className="rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-50">
              {formatSocketId(activeLink.source_socket)} on {sourceCardName}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className={modalFieldLabelClassName}>Plugged in</span>
            <p className="rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-50">
              {targetCardName}
            </p>
          </div>

          {error ? (
            <p className="text-sm text-wn-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-wn-mono-800 px-4 py-3">
        <Button
          variant="danger"
          size="base"
          isDisabled={isDeleting}
          onPress={() => {
            void handleDelete();
          }}
        >
          {isDeleting ? "Removing…" : "Remove link"}
        </Button>
      </footer>
    </AnimatedPanel>
  );
}
