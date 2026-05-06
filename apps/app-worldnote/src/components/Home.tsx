import { WnButton, WorldCard, headingClass } from "@worldnote/ui";

type Props = {
  onOpenVault: () => void;
};

export function Home({ onOpenVault }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 p-8">
      <div className="text-center">
        <h1 className={headingClass.h1}>WorldNote</h1>
        <p className="mt-2 text-zinc-400">Building better worlds.</p>
      </div>
      <WorldCard title="Launcher" subtitle="Librarian">
        <p className="text-sm text-zinc-300">
          Select a world directory to create `.worldnote` config and `lore/`
          JSON storage.
        </p>
        <div className="mt-4">
          <WnButton color="primary" onPress={onOpenVault}>
            Open world folder (stub)
          </WnButton>
        </div>
      </WorldCard>
    </div>
  );
}
