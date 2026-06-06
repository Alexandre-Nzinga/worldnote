import { MaterialSymbol } from "@worldnote/ui";
import type { PillarVariant } from "@/components/landing/landingContent";
import { landingVisualPanelClassName } from "./landingCardStyles";

type VisualPlaceholderProps = {
  variant: PillarVariant | "hero";
  className?: string;
};

function CanvasVisual() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-wn-mono-600) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        aria-hidden
        className="absolute left-[18%] top-[28%] h-14 w-24 rounded-xl border border-white/15 bg-wn-mono-800 shadow-lg"
      />
      <div
        aria-hidden
        className="absolute right-[22%] top-[22%] h-12 w-20 rounded-xl border border-white/15 bg-wn-mono-800 shadow-lg"
      />
      <div
        aria-hidden
        className="absolute bottom-[24%] left-[38%] h-16 w-28 rounded-xl border border-wn-azure-500/40 bg-wn-mono-800 shadow-[0_0_24px_-4px_var(--color-wn-azure-500)]"
      />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-wn-azure-400/50"
        viewBox="0 0 320 180"
        fill="none"
      >
        <path
          d="M80 70 C120 90, 160 50, 220 55"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M220 55 C200 100, 170 120, 130 130"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <MaterialSymbol
        name="dashboard"
        className="relative z-10 text-4xl text-wn-mono-400 opacity-0"
      />
    </>
  );
}

function GraphVisual() {
  return (
    <>
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-wn-indigo-400/60"
        viewBox="0 0 320 180"
        fill="none"
      >
        <circle cx="160" cy="90" r="6" fill="currentColor" />
        <circle cx="90" cy="60" r="5" fill="currentColor" />
        <circle cx="240" cy="55" r="5" fill="currentColor" />
        <circle cx="70" cy="130" r="5" fill="currentColor" />
        <circle cx="250" cy="125" r="5" fill="currentColor" />
        <line x1="160" y1="90" x2="90" y2="60" stroke="currentColor" strokeWidth="1.5" />
        <line x1="160" y1="90" x2="240" y2="55" stroke="currentColor" strokeWidth="1.5" />
        <line x1="160" y1="90" x2="70" y2="130" stroke="currentColor" strokeWidth="1.5" />
        <line x1="160" y1="90" x2="250" y2="125" stroke="currentColor" strokeWidth="1.5" />
        <line x1="90" y1="60" x2="240" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
      <MaterialSymbol
        name="hub"
        className="relative z-10 text-4xl text-wn-mono-400 opacity-0"
      />
    </>
  );
}

function TimelineVisual() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-wn-mono-600"
      />
      <div
        aria-hidden
        className="absolute left-[15%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-wn-amber-400"
      />
      <div
        aria-hidden
        className="absolute left-[35%] top-[38%] h-8 w-28 rounded-md border border-wn-rose-400/40 bg-wn-rose-400/10"
      />
      <div
        aria-hidden
        className="absolute right-[28%] top-[48%] h-6 w-20 rounded-md border border-wn-azure-400/40 bg-wn-azure-400/10"
      />
      <div
        aria-hidden
        className="absolute right-[12%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-wn-lime-400"
      />
      <MaterialSymbol
        name="timeline"
        className="relative z-10 text-4xl text-wn-mono-400 opacity-0"
      />
    </>
  );
}

function HeroVisual() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-wn-azure-500/10 via-transparent to-black/50"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-wn-mono-600) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden
        className="absolute left-[12%] top-[20%] h-16 w-32 rounded-2xl border border-white/20 bg-wn-mono-800/90 shadow-xl"
      />
      <div
        aria-hidden
        className="absolute right-[14%] top-[18%] h-14 w-28 rounded-2xl border border-white/15 bg-wn-mono-800/80 shadow-lg"
      />
      <div
        aria-hidden
        className="absolute bottom-[18%] left-[32%] h-20 w-40 rounded-2xl border border-wn-azure-500/50 bg-wn-mono-800/90 shadow-[0_0_32px_-6px_var(--color-wn-azure-500)]"
      />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-wn-azure-400/40"
        viewBox="0 0 800 400"
        fill="none"
      >
        <path
          d="M120 100 C220 140, 320 80, 480 90"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path
          d="M480 90 C420 200, 360 260, 280 300"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-wn-azure-500/20"
      />
    </>
  );
}

const visualByVariant = {
  hero: HeroVisual,
  canvas: CanvasVisual,
  graph: GraphVisual,
  timeline: TimelineVisual,
} as const;

export function VisualPlaceholder({ variant, className }: VisualPlaceholderProps) {
  const Visual = visualByVariant[variant];
  const heightClass = variant === "hero" ? "h-[280px] md:h-[360px]" : "h-[160px]";

  return (
    <div
      className={[landingVisualPanelClassName, heightClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/40"
      />
      <Visual />
    </div>
  );
}
