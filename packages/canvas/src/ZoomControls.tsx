import { Panel, useReactFlow, useViewport } from "@xyflow/react";
import { SegmentedControl } from "./ui/SegmentedControl.js";

const panelClassName =
  "!m-0 !mb-2 !ml-2 !border-0 !bg-transparent !p-0 !shadow-none";

function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}

/** Zoom in/out controls with live viewport percentage (must render inside ReactFlow). */
export function ZoomControls() {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut } = useReactFlow();
  const percent = formatZoomPercent(zoom);

  return (
    <Panel position="bottom-left" className={panelClassName}>
      <SegmentedControl
        ariaLabel="Zoom"
        segments={[
          {
            id: "zoom-in",
            icon: "add",
            ariaLabel: "Zoom in",
            onPress: () => zoomIn(),
          },
          {
            id: "zoom-level",
            content: percent,
            ariaLabel: `Zoom level ${percent}`,
          },
          {
            id: "zoom-out",
            icon: "remove",
            ariaLabel: "Zoom out",
            onPress: () => zoomOut(),
          },
        ]}
      />
    </Panel>
  );
}
