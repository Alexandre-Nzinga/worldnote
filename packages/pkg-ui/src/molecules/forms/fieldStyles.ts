import { headingClass } from "../../brand/typography/typography.js";

/** Shared HeroUI field slot classes — theme-aware surfaces/borders/text. */

export const fieldInputWrapperClassName =
  "rounded-xl border border-wn-border-strong bg-wn-surface hover:!bg-wn-surface-raised data-[hover=true]:!bg-wn-surface-raised data-[hover=true]:!border-wn-mono-600 group-data-[focus=true]:!border-wn-mono-500 group-data-[focus=true]:!bg-wn-surface";

export const fieldInputClassName =
  "!text-wn-text placeholder:!text-wn-text-subtle data-[hover=true]:!text-wn-text";

export const fieldInnerWrapperClassName =
  "bg-transparent data-[hover=true]:bg-transparent";

/** HeroUI Input/Textarea slots (no built-in label). */
export const fieldInputClassNames = {
  inputWrapper: fieldInputWrapperClassName,
  input: fieldInputClassName,
  innerWrapper: fieldInnerWrapperClassName,
};

export const fieldLabelClassName = "text-sm font-wn-medium text-wn-text";

/** Subtle label for read-only rows and inspector fields (below section titles). */
export const fieldLabelSubtleClassName =
  "text-wn-xs font-wn-medium text-wn-text-subtle";

/** Stacked inspector/form sections with dividers between blocks. */
export const sectionStackClassName = "flex flex-col divide-y divide-wn-border";

/** Single section block inside a `sectionStackClassName` container. */
export const sectionClassName = "flex flex-col gap-3 py-5 first:pt-0";

/** Read-only field value text. */
export const fieldValueClassName = "text-sm text-wn-text";

/** Borderless inline input wrapper (inspector, property rows). */
export const inlineFieldInputWrapperClassName =
  "min-h-0 h-auto rounded-none border-0 bg-transparent px-0 shadow-none hover:!bg-transparent data-[hover=true]:!bg-transparent group-data-[focus=true]:!bg-transparent";

/** HeroUI Input slots for borderless inline edits. */
export const inlineFieldInputClassNames = {
  inputWrapper: inlineFieldInputWrapperClassName,
  innerWrapper: fieldInnerWrapperClassName,
  input: fieldInputClassName,
};

/** Card name field — matches `getHeadingProps("h4", { tone: "inverse", weight: "bold" })`. */
export const nameFieldInputClassNames = {
  inputWrapper: `${inlineFieldInputWrapperClassName} !h-auto min-h-0`,
  innerWrapper: fieldInnerWrapperClassName,
  input: `${headingClass.h4} !text-wn-h4 font-wn-bold text-wn-text placeholder:!text-wn-text-subtle data-[hover=true]:!text-wn-text`,
};

/** Card subtitle field — body scale, muted tone. */
export const subtitleFieldInputClassNames = {
  inputWrapper: inlineFieldInputWrapperClassName,
  innerWrapper: fieldInnerWrapperClassName,
  input:
    "!text-wn-body font-wn-medium leading-snug text-wn-text-muted placeholder:!text-wn-text-subtle data-[hover=true]:!text-wn-text-muted",
};

/** Borderless textarea for inspector lore and long text. */
export const inlineTextareaFieldInputClassNames = {
  inputWrapper: `${inlineFieldInputWrapperClassName} py-0`,
  innerWrapper: fieldInnerWrapperClassName,
  input: `${fieldInputClassName} min-h-[5rem] resize-none leading-relaxed`,
};

/** Compact toolbar action (text + icon). */
export const toolbarActionButtonClassName =
  "flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-wn-small font-wn-medium text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text disabled:opacity-50";

/** Compact toolbar icon-only control. */
export const toolbarIconButtonClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text disabled:opacity-50";

/** Semi-transparent chip on image overlays. */
export const overlayChipClassName =
  "rounded-xl bg-wn-mono-950/80 px-2.5 py-1 text-wn-xs font-wn-medium text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text disabled:opacity-40";

/** Same chip look for non-interactive overlay labels. */
export const overlayChipLabelClassName =
  "rounded-xl bg-wn-mono-950/80 px-2.5 py-1 text-wn-xs font-wn-medium text-wn-text-muted";

/** Label + control stack (Inspector, Settings, Vault, Wizard). */
export const fieldStackClassName = "flex w-full flex-col gap-1";

/** Label row with optional trailing clear action. */
export const fieldLabelRowClassName =
  "flex items-center justify-between gap-2";

/** Clear affordance for searchable / reference pickers. */
export const fieldClearButtonClassName =
  "flex shrink-0 items-center justify-center rounded-lg p-1 text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text";

/** Pill select / dropdown trigger (EnumComboBox, custom pickers). */
export const selectTriggerClassName =
  "relative h-10 min-h-10 w-full rounded-full border border-wn-border-strong bg-wn-surface px-3 pr-9 shadow-none transition-colors data-[hover=true]:border-wn-mono-600 data-[hover=true]:!bg-wn-surface group-data-[focus=true]:border-wn-mono-500 group-data-[focus=true]:!bg-wn-surface";

/** Native `<button>` select trigger (color swatch, icon pickers). */
export const selectButtonTriggerClassName = `${selectTriggerClassName} flex items-center gap-2.5 text-left text-sm text-wn-text outline-none focus-visible:ring-2 focus-visible:ring-wn-mono-600`;

/** Like `selectButtonTriggerClassName`, but with a tight left inset for a leading swatch. */
export const selectSwatchButtonTriggerClassName =
  "relative flex h-10 min-h-10 w-full items-center gap-2 rounded-full border border-wn-border-strong bg-wn-surface pl-1 pr-9 text-left text-sm text-wn-text shadow-none outline-none transition-colors hover:border-wn-mono-600 hover:bg-wn-surface focus-visible:ring-2 focus-visible:ring-wn-mono-600";

/** Compact inline select trigger (toolbars). */
export const selectInlineTriggerClassName =
  "relative h-8 min-h-8 max-w-40 rounded-lg border-0 bg-transparent px-2 pr-7 shadow-none data-[hover=true]:bg-wn-mono-800 group-data-[focus=true]:bg-wn-mono-800";

export const selectValueClassName =
  "w-full min-w-0 truncate text-left text-sm text-wn-text group-data-[has-value=true]:text-wn-text";

export const selectInlineValueClassName =
  "w-full min-w-0 truncate text-left text-xs text-wn-text-muted group-data-[has-value=true]:text-wn-text-muted";

export const selectSelectorIconClassName =
  "pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-wn-text-muted";

export const selectInlineSelectorIconClassName =
  "pointer-events-none absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-wn-text-muted";

/** Searchable card reference combobox — matches `selectTriggerClassName` silhouette. */
export const comboboxInputWrapperClassName =
  "flex h-10 min-h-10 w-full items-center gap-0 rounded-full border border-wn-border-strong bg-wn-surface px-3 shadow-none ring-0 outline-none transition-colors hover:!border-wn-mono-600 hover:!bg-wn-surface data-[hover=true]:!border-wn-mono-600 data-[hover=true]:!bg-wn-surface group-data-[focus=true]:!border-wn-mono-500 group-data-[focus=true]:!bg-wn-surface group-data-[focus=true]:ring-0";

export const selectPopoverClassName =
  "z-[250] rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-1 shadow-lg";

export const selectListboxClassName = "max-h-60 gap-0.5 overflow-y-auto";

export const selectItemClassName =
  "rounded-lg text-wn-mono-100 outline-none ring-0 data-[hover=true]:bg-wn-mono-700 data-[hover=true]:text-wn-mono-50 data-[focus=true]:bg-wn-mono-700 data-[focus=true]:!text-wn-mono-50 data-[focus=true]:outline data-[focus=true]:outline-2 data-[focus=true]:outline-offset-0 data-[focus=true]:outline-wn-mono-50 data-[focus-visible=true]:outline data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-0 data-[focus-visible=true]:outline-wn-mono-50 data-[selected=true]:bg-wn-mono-600 data-[selected=true]:text-wn-mono-50";

export const comboboxHeaderItemClassName =
  "pointer-events-none cursor-default rounded-lg px-2 py-1 data-[hover=true]:bg-transparent";
