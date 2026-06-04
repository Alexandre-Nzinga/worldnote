import { createContext, useContext, type ReactNode } from "react";

export type CanvasStickyNoteResizeEnd = (
  nodeId: string,
  size: { width: number; height: number },
) => void;

export type CanvasStickyNoteInteractionContextValue = {
  onResizeEnd?: CanvasStickyNoteResizeEnd;
};

const CanvasStickyNoteInteractionContext =
  createContext<CanvasStickyNoteInteractionContextValue | null>(null);

export function CanvasStickyNoteInteractionProvider({
  value,
  children,
}: {
  value: CanvasStickyNoteInteractionContextValue;
  children: ReactNode;
}) {
  return (
    <CanvasStickyNoteInteractionContext.Provider value={value}>
      {children}
    </CanvasStickyNoteInteractionContext.Provider>
  );
}

export function useCanvasStickyNoteInteraction(): CanvasStickyNoteInteractionContextValue {
  return useContext(CanvasStickyNoteInteractionContext) ?? {};
}
