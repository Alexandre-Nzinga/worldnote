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

export const fieldLabelClassName = "text-sm font-medium text-wn-text";
