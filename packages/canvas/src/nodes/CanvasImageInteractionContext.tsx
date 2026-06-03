import { createContext, useContext, type ReactNode } from "react";

export type CanvasImageResizeEnd = (
  nodeId: string,
  size: { width: number; height: number },
) => void;

export type CanvasImageInteractionContextValue = {
  onResizeEnd?: CanvasImageResizeEnd;
};

const CanvasImageInteractionContext =
  createContext<CanvasImageInteractionContextValue | null>(null);

export function CanvasImageInteractionProvider({
  value,
  children,
}: {
  value: CanvasImageInteractionContextValue;
  children: ReactNode;
}) {
  return (
    <CanvasImageInteractionContext.Provider value={value}>
      {children}
    </CanvasImageInteractionContext.Provider>
  );
}

export function useCanvasImageInteraction(): CanvasImageInteractionContextValue {
  return useContext(CanvasImageInteractionContext) ?? {};
}
