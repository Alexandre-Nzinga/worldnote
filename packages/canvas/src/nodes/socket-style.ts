export type SocketStyle = {
  fillClass: string;
  emptyRingClass: string;
};

export function socketStyleFor(
  accepts: readonly string[],
  cardinality: "single" | "many",
): SocketStyle {
  if (cardinality === "many") {
    return {
      fillClass: "bg-wn-lime-300",
      emptyRingClass: "border-wn-lime-300",
    };
  }
  if (accepts.includes("location")) {
    return {
      fillClass: "bg-wn-azure-300",
      emptyRingClass: "border-wn-azure-300",
    };
  }
  return {
    fillClass: "bg-wn-amber-300",
    emptyRingClass: "border-wn-amber-300",
  };
}

/** Visual socket dot size on the card border (node view). */
export const SOCKET_DOT_SIZE_CLASS = "h-3.5 w-3.5";

export function socketDotClassName(
  occupied: boolean,
  style: SocketStyle,
): string {
  if (occupied) {
    return `${SOCKET_DOT_SIZE_CLASS} shrink-0 rounded-full border-0 ${style.fillClass}`;
  }
  return `${SOCKET_DOT_SIZE_CLASS} shrink-0 rounded-full border-2 bg-wn-mono-600 ${style.emptyRingClass}`;
}

/** React Flow handle on the card border (node view) — colored by socket type. */
export function socketHandleClassName(
  occupied: boolean,
  style: SocketStyle,
): string {
  const base =
    "!h-3.5 !w-3.5 !min-h-0 !min-w-0 !rounded-full !opacity-100 !z-30 pointer-events-auto";
  if (occupied) {
    return `${base} !border-0 ${style.fillClass}`;
  }
  return `${base} !border-2 !bg-wn-mono-600 ${style.emptyRingClass}`;
}

export const entitySourceHandleClassName =
  "!h-3.5 !w-3.5 !min-h-0 !min-w-0 !border-2 !border-wn-mono-400 !bg-wn-mono-200 !opacity-100 !z-30 pointer-events-auto";
