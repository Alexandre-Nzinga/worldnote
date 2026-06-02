import { MiniMap, Panel } from "@xyflow/react";
import { useState } from "react";

const miniMapProps = {
  className: "!m-0 !border !border-wn-mono-700 !bg-wn-mono-900 !shadow-sm",
  maskColor: "rgba(9, 9, 9, 0.55)",
  nodeColor: "var(--color-wn-mono-600)",
  pannable: true,
  zoomable: true,
} as const;

export function CollapsibleMiniMap() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {isOpen ? (
        <MiniMap
          position="bottom-right"
          {...miniMapProps}
          style={{ marginBottom: 40, marginRight: 8 }}
        />
      ) : null}
      <Panel
        position="bottom-right"
        className="!m-0 !mb-2 !mr-2 !border-0 !bg-transparent !p-0 !shadow-none"
      >
        <button
          type="button"
          aria-label={isOpen ? "Collapse minimap" : "Expand minimap"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-wn-mono-700 bg-wn-mono-900 px-2.5 text-xs font-medium text-wn-mono-300 shadow-sm transition-colors hover:border-wn-mono-600 hover:bg-wn-mono-800 hover:text-wn-mono-50"
        >
          <span className="text-sm leading-none" aria-hidden>
            {isOpen ? "−" : "+"}
          </span>
          <span>Map</span>
        </button>
      </Panel>
    </>
  );
}
