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
  return (
    <div className="h-full w-full min-h-[400px] rounded-[var(--radius-2xl)] border border-zinc-800 bg-zinc-950">
      <ReactFlow {...props}>
        <Background gap={16} color="#3f3f46" />
        <MiniMap className="!bg-zinc-900" maskColor="rgba(24,24,27,0.6)" />
        <Controls className="!bg-zinc-900 !border-zinc-800" />
        {children}
      </ReactFlow>
    </div>
  );
}
