import clsx from "clsx";

export type MaterialSymbolProps = {
  /** Material Symbols icon name (snake_case), e.g. `arrow_back`. */
  name: string;
  className?: string;
  /** Use filled variant (FILL=1). */
  filled?: boolean;
};

/** Google Material Symbols Outlined icon (ligature font). */
export function MaterialSymbol({
  name,
  className,
  filled = false,
}: MaterialSymbolProps) {
  return (
    <span
      className={clsx("material-symbols-outlined select-none leading-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
