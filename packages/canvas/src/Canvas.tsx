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
};

export function WorldNoteCanvas({ children, ...props }: WorldNoteCanvasProps) {
  const mono700 = "var(--color-wn-mono-700)";

  return (
    <div className="h-full w-full min-h-[400px] rounded-[var(--radius-2xl)] border border-wn-mono-800 bg-wn-mono-950">
      <ReactFlow {...props}>
        <Background gap={16} color={mono700} />
        <MiniMap className="!bg-wn-mono-900" maskColor="rgba(24,24,27,0.6)" />
        <Controls className="!bg-wn-mono-900 !border-wn-mono-800" />
        {children}
      </ReactFlow>
    </div>
  );
}

