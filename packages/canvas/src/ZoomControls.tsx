import { Button, ButtonGroup } from "@heroui/react";
import { Panel, useReactFlow, useViewport } from "@xyflow/react";

const panelClassName =
  "!m-0 !mb-2 !ml-2 !border-0 !bg-transparent !p-0 !shadow-none";

const groupClassName =
  "overflow-hidden rounded-full border border-wn-mono-700 bg-wn-mono-900 shadow-sm";

const zoomButtonClassName =
  "min-w-9 rounded-none border-0 bg-transparent px-2 text-wn-mono-200 hover:bg-wn-mono-800 data-[hover=true]:bg-wn-mono-800";

const zoomPercentClassName =
  "min-w-[3.25rem] cursor-default rounded-none border-0 bg-transparent px-2 font-semibold tabular-nums text-wn-mono-400 opacity-100 data-[disabled=true]:opacity-100";

function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}

function ZoomDivider() {
  return <span className="h-5 w-px shrink-0 bg-wn-mono-700" aria-hidden />;
}

/** Zoom in/out controls with live viewport percentage (must render inside ReactFlow). */
export function ZoomControls() {
  const { zoom } = useViewport();
  const { zoomIn, zoomOut } = useReactFlow();
  const percent = formatZoomPercent(zoom);

  return (
    <Panel position="bottom-left" className={panelClassName}>
      <ButtonGroup
        variant="bordered"
        radius="full"
        size="sm"
        className={groupClassName}
        aria-label="Zoom"
      >
        <Button
          isIconOnly
          aria-label="Zoom in"
          className={zoomButtonClassName}
          onPress={() => zoomIn()}
        >
          <i className="ri-add-line text-base" aria-hidden />
        </Button>
        <ZoomDivider />
        <Button
          isDisabled
          disableRipple
          className={zoomPercentClassName}
          aria-live="polite"
          aria-label={`Zoom level ${percent}`}
        >
          {percent}
        </Button>
        <ZoomDivider />
        <Button
          isIconOnly
          aria-label="Zoom out"
          className={zoomButtonClassName}
          onPress={() => zoomOut()}
        >
          <i className="ri-subtract-line text-base" aria-hidden />
        </Button>
      </ButtonGroup>
    </Panel>
  );
}
