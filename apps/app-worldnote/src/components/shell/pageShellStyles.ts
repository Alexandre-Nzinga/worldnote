import { fieldInputClassNames } from "@worldnote/ui";
/** Full-page app screens (Settings, Vault, etc.). */

export const pageShellClassName =
  "relative flex h-screen flex-col overflow-hidden text-wn-text";

/** Subtle dot grid over the page background. */
export const pageBackdropClassName =
  "pointer-events-none absolute inset-0 bg-wn-bg [background-image:radial-gradient(circle,var(--color-wn-mono-800)_1px,transparent_1px)] [background-size:22px_22px]";

export const surfacePanelClassName =
  "overflow-visible rounded-2xl bg-wn-surface px-5 py-5 shadow-sm";

export const surfacePanelStackClassName = "flex flex-col gap-4";

export const panelRowListClassName = "flex flex-col divide-y divide-wn-border";

export const panelRowClassName = "py-4 first:pt-0";

/** Borderless HeroUI field slots for inputs inside surface panels. */
export const panelFieldInputClassNames = {
  ...fieldInputClassNames,
  inputWrapper: `${fieldInputClassNames.inputWrapper} h-10 min-h-10`,
};

/** Segmented toggle group (sort, theme, etc.). */
export const segmentTrackClassName =
  "inline-flex w-fit gap-1 rounded-full bg-wn-surface-sunken p-1";

export const segmentButtonClassName = (isActive: boolean) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-wn-surface-raised text-wn-text shadow-sm"
      : "text-wn-text-muted hover:text-wn-text",
  ].join(" ");
