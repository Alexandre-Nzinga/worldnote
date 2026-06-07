/** Shared class names for the user-selected primary accent (CSS vars on :root). */

export const primaryAccentFillClassName =
  "bg-wn-primary text-wn-primary-foreground";

export const primaryAccentHoverFillClassName =
  "hover:bg-wn-primary-hover data-[hover=true]:bg-wn-primary-hover";

export const primaryAccentInteractiveClassName = `${primaryAccentFillClassName} ${primaryAccentHoverFillClassName}`;

export const primaryAccentRingClassName =
  "ring-2 ring-wn-primary ring-offset-2";

export const primaryAccentRingOnSurfaceClassName = `${primaryAccentRingClassName} ring-offset-wn-surface`;

export const primaryAccentRingOnDarkClassName = `${primaryAccentRingClassName} ring-offset-wn-mono-900`;

/** Bordered chips / quick actions that pick up the user accent on hover. */
export const primaryAccentChipClassName =
  "border border-wn-border bg-wn-surface text-wn-text-muted transition-colors hover:border-wn-primary hover:bg-wn-primary/12 hover:text-wn-primary";

export const dockInactiveClassName = "bg-wn-mono-800 text-wn-mono-50";
