import { Button, WorldNoteLogo, getBodyTextStyle } from "@worldnote/ui";

type CanvasHeaderProps = {
  onBack: () => void;
  vaultLabel?: string;
};

export function CanvasHeader({ onBack, vaultLabel }: CanvasHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e4e4e4] bg-[#f7f7f7] px-4 py-2">
      <div className="min-w-[170px]">
        <WorldNoteLogo
          variant="icon"
          tone="black"
          className="mb-1 h-7 w-7"
          alt="WorldNote"
        />
        <p
          style={{
            ...getBodyTextStyle("small"),
            color: "var(--color-wn-mono-600)",
          }}
        >
          {vaultLabel ?? "Local-first worldbuilding canvas"}
        </p>
      </div>
      <div className="flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-[#efefef] p-1">
        <button
          type="button"
          className="rounded-full px-4 py-1 text-[11px] font-medium text-wn-mono-500"
        >
          Dashboard
        </button>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-1 text-[11px] font-semibold text-wn-mono-900 shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
        >
          Canvas
        </button>
        <button
          type="button"
          className="rounded-full px-4 py-1 text-[11px] font-medium text-wn-mono-500"
        >
          Cards
        </button>
      </div>
      <Button
        variant="secondary"
        className="border border-[#d8d8d8] bg-white text-wn-mono-700 data-[hover=true]:bg-[#f0f0f0]"
        onPress={onBack}
      >
        Back to launcher
      </Button>
    </header>
  );
}
