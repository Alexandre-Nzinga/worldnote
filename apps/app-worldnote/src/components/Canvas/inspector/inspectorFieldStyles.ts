/** Shared inspector field styles — borderless edits that match read-only typography. */

export const inspectorSectionLabelClassName =
  "text-xs font-semibold uppercase tracking-wide text-wn-text-subtle";

/** Field label in read/edit inspector rows (below section headings). */
export const inspectorFieldLabelClassName =
  "text-xs font-medium text-wn-text-subtle";

/** Field value in read-only inspector rows. */
export const inspectorFieldValueClassName = "text-sm text-wn-text";

const inlineInputWrapper =
  "min-h-0 h-auto rounded-none border-0 bg-transparent px-0 shadow-none hover:!bg-transparent data-[hover=true]:!bg-transparent group-data-[focus=true]:!bg-transparent";

const inlineInnerWrapper = "bg-transparent data-[hover=true]:bg-transparent";

export const inspectorInlineInputClassNames = {
  inputWrapper: inlineInputWrapper,
  innerWrapper: inlineInnerWrapper,
  input:
    "!text-sm text-wn-mono-200 placeholder:!text-wn-mono-600 data-[hover=true]:!text-wn-mono-200",
};

export const inspectorNameFieldClassNames = {
  inputWrapper: inlineInputWrapper,
  innerWrapper: inlineInnerWrapper,
  input:
    "!text-2xl !font-bold !leading-tight !tracking-tight text-wn-mono-50 placeholder:!text-wn-mono-600 data-[hover=true]:!text-wn-mono-50",
};

export const inspectorSubtitleFieldClassNames = {
  inputWrapper: inlineInputWrapper,
  innerWrapper: inlineInnerWrapper,
  input:
    "!text-base !font-medium !leading-snug text-wn-mono-300 placeholder:!text-wn-mono-600 data-[hover=true]:!text-wn-mono-300",
};

export const inspectorTextareaClassNames = {
  inputWrapper: `${inlineInputWrapper} py-0`,
  innerWrapper: inlineInnerWrapper,
  input:
    "!text-wn-mono-200 placeholder:!text-wn-mono-600 min-h-[5rem] resize-none leading-relaxed data-[hover=true]:!text-wn-mono-200",
};

export const inspectorImageOverlayChipClassName =
  "rounded-lg bg-wn-mono-950/80 px-2.5 py-1 text-xs font-medium text-wn-mono-200 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:opacity-40";

/** Same chip look for non-interactive overlay labels. */
export const inspectorImageOverlayLabelClassName =
  "rounded-lg bg-wn-mono-950/80 px-2.5 py-1 text-xs font-medium text-wn-mono-200";
