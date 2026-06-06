export {
  pageShellClassName as settingsPageClassName,
  pageBackdropClassName as settingsPageBackdropClassName,
  surfacePanelClassName as settingsPanelClassName,
  surfacePanelStackClassName as settingsPanelStackClassName,
  panelRowListClassName as settingsRowListClassName,
  panelRowClassName as settingsRowClassName,
  panelFieldInputClassNames as settingsFieldInputClassNames,
} from "../shell/pageShellStyles.js";

export { selectButtonTriggerClassName as settingsSelectClassName } from "@worldnote/ui";

export const settingsReadOnlyValueClassName =
  "rounded-full border border-wn-border-strong bg-wn-surface px-3 py-2.5 text-sm text-wn-text";

export const settingsShortcutKeyClassName =
  "min-w-28 rounded-xl bg-wn-surface-raised px-3 py-2 text-sm font-medium text-wn-text transition-colors hover:bg-wn-mono-800 focus-visible:ring-2 focus-visible:ring-wn-mono-600 disabled:cursor-not-allowed disabled:opacity-40";

export const settingsShortcutKeyRecordingClassName =
  "min-w-28 rounded-xl bg-wn-mono-800 px-3 py-2 text-sm font-medium text-wn-mono-50 ring-2 ring-wn-mono-600";
