import {
  Background,
  Controls,
  ReactFlow,
  type ReactFlowProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CollapsibleMiniMap } from "./CollapsibleMiniMap.js";

export type WorldNoteCanvasProps = Omit<ReactFlowProps, "children"> & {
  children?: React.ReactNode;
  backgroundVariant?: "lines" | "dots" | "cross";
  backgroundColor?: string;
  backgroundGap?: number;
};

export function WorldNoteCanvas({
  children,
  backgroundVariant = "dots",
  backgroundColor = "var(--color-wn-mono-700)",
  backgroundGap = 16,
  colorMode = "dark",
  nodesDraggable = true,
  nodesConnectable = false,
  elementsSelectable = true,
  panOnDrag = [1],
  panOnScroll = false,
  zoomOnScroll = true,
  zoomOnPinch = true,
  selectNodesOnDrag = false,
  deleteKeyCode = null,
  ...props
}: WorldNoteCanvasProps) {
  return (
    <div className="h-full w-full min-h-0 rounded-2xl border border-wn-mono-800 bg-wn-mono-950">
      <ReactFlow
        colorMode={colorMode}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={elementsSelectable}
        panOnDrag={panOnDrag}
        panOnScroll={panOnScroll}
        zoomOnScroll={zoomOnScroll}
        zoomOnPinch={zoomOnPinch}
        selectNodesOnDrag={selectNodesOnDrag}
        deleteKeyCode={deleteKeyCode}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full bg-wn-mono-950"
        {...props}
      >
        <Background
          variant={backgroundVariant as unknown as undefined}
          gap={backgroundGap}
          color={backgroundColor}
        />
        <CollapsibleMiniMap />
        <Controls
          position="bottom-left"
          showFitView={false}
          showInteractive={false}
          className="!border !border-wn-mono-700 !bg-wn-mono-900 !shadow-sm [&_button]:!border-wn-mono-700 [&_button]:!bg-wn-mono-800 [&_button]:!text-wn-mono-200 [&_button:hover]:!bg-wn-mono-700"
        />
        {children}
      </ReactFlow>
    </div>
  );
}
