import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type ReactFlowProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type WorldNoteCanvasProps = Omit<ReactFlowProps, "children"> & {
  children?: React.ReactNode;
  backgroundVariant?: "lines" | "dots" | "cross";
  backgroundColor?: string;
  backgroundGap?: number;
};

export function WorldNoteCanvas({
  children,
  backgroundVariant = "dots",
  backgroundColor = "#dadada",
  backgroundGap = 16,
  ...props
}: WorldNoteCanvasProps) {
  return (
    <div className="h-full w-full min-h-[400px] rounded-[var(--radius-2xl)] border border-[#dfdfdf] bg-[#f4f4f4]">
      <ReactFlow {...props}>
        <Background
          variant={backgroundVariant as unknown as undefined}
          gap={backgroundGap}
          color={backgroundColor}
        />
        <MiniMap
          className="!bg-white !border !border-[#d8d8d8]"
          maskColor="rgba(17, 24, 39, 0.16)"
        />
        <Controls className="!hidden" />
        {children}
      </ReactFlow>
    </div>
  );
}
