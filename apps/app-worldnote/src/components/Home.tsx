import { Button, Card, headingClass } from "@worldnote/ui";

type Props = {
  onOpenVault: () => void;
};

export function Home({ onOpenVault }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-wn-mono-950 p-8">
      <div className="text-center">
        <h1 className={headingClass.h1}>WorldNote</h1>
        <p className="mt-2 text-wn-mono-400">Building better worlds.</p>
      </div>
      <Card title="Home" subtitle="Librarian">
        <p className="text-sm text-wn-mono-300">
          Select a world directory to create `.worldnote` config and `lore/`
          JSON storage.
        </p>
        <div className="mt-4">
          <Button variant="primary" onPress={onOpenVault}>
            Open world folder (stub)
          </Button>
        </div>
      </Card>
    </div>
  );
}

