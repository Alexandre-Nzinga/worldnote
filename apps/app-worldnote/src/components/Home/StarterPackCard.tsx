import {
  getBodyTextStyle,
  MaterialSymbol,
  MotionPressable,
  Pill,
  WorldNoteLogo,
} from "@worldnote/ui";
import type { StarterPack } from "../../services/starterPacks/index.js";
import { starterPackCoverSrc } from "./starterPackCovers.js";
import { worldCoverStyle } from "./worldCover.js";

type StarterPackCardProps = {
  pack: StarterPack;
  disabled?: boolean;
  onStart: (pack: StarterPack) => void;
};

const cardClassName = [
  "group relative mx-auto flex w-full max-w-[360px] flex-col overflow-hidden text-left",
  "rounded-wn-card border border-black/10 dark:border-white/10",
  "bg-linear-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.07] dark:to-white/[0.02]",
  "shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-24px_rgba(0,0,0,0.7)]",
  "backdrop-blur-2xl",
  "transition-colors duration-200",
  "hover:from-black/[0.06] hover:to-black/[0.02] hover:border-black/15",
  "dark:hover:from-white/[0.1] dark:hover:to-white/[0.04] dark:hover:border-white/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const pillClassName = [
  "bg-wn-mono-700",
  "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
  "w-fit justify-center tabular-nums",
].join(" ");

/** Home starter pack card — matches world card silhouette with pack metadata. */
export function StarterPackCard({
  pack,
  disabled,
  onStart,
}: StarterPackCardProps) {
  const coverSrc = starterPackCoverSrc(pack.coverFile);

  return (
    <div className={cardClassName} style={{ borderRadius: "var(--radius-wn-card)" }}>
      <MotionPressable
        disabled={disabled}
        enableHover
        onClick={() => onStart(pack)}
        className="flex w-full flex-col text-left"
      >
        <div className="p-2.5">
          <div
            className="relative h-[160px] overflow-hidden rounded-2xl bg-wn-mono-900"
            style={coverSrc ? undefined : worldCoverStyle(pack.name)}
          >
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MaterialSymbol
                  name={pack.icon}
                  className="text-6xl text-wn-mono-50/90"
                />
              </div>
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/40"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_0_0_1px_rgba(0,0,0,0.3)_inset]"
            />
            <WorldNoteLogo
              variant="icon"
              tone="white"
              className="absolute left-3 top-3 h-5 w-5 opacity-60"
              alt=""
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4 pt-1">
          <div className="truncate text-base font-semibold text-wn-mono-50">
            {pack.name}
          </div>
          <p
            className="line-clamp-2 text-wn-mono-400"
            style={getBodyTextStyle("small")}
          >
            {pack.description}
          </p>
          <Pill size="sm" className={pillClassName} textClassName="text-wn-mono-50">
            {pack.cards.length} cards · {pack.links.length} links
          </Pill>
        </div>
      </MotionPressable>
    </div>
  );
}
