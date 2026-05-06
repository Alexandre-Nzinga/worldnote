import {
  BondEdge,
  CardNode,
  WorldNoteCanvas,
  type CardFlowNode,
} from "@worldnote/canvas";
import { Button, Card, headingClass } from "@worldnote/ui";
import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { Home } from "./components/Home.js";

const nodeTypes = {
  worldnoteCard: CardNode,
};

const edgeTypes = {
  bond: BondEdge,
};

export default function App() {
  const [started, setStarted] = useState(false);
  const nodes = useMemo<CardFlowNode[]>(
    () => [
      {
        id: "1",
        type: "worldnoteCard",
        position: { x: 0, y: 0 },
        data: { title: "Sample card", subtitle: "Canvas node" },
      },
    ],
    [],
  );
  const edges = useMemo(
    () => [] as { id: string; source: string; target: string; type: string }[],
    [],
  );

  const onOpenVault = useCallback(() => setStarted(true), []);

  if (!started) {
    return <Home onOpenVault={onOpenVault} />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={headingClass.h1}>WorldNote</h1>
          <p className="text-zinc-400">Local-first worldbuilding (shell)</p>
        </div>
        <Button color="primary" onPress={() => setStarted(false)}>
          Back to launcher
        </Button>
      </header>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card title="Vault" subtitle="Placeholder">
          <p>Open a folder to initialize `.worldnote` and `lore/`.</p>
        </Card>
        <ReactFlowProvider>
          <WorldNoteCanvas
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            fitView
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
