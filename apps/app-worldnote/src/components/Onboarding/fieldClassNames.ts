/** Themed HeroUI field slots — surfaces/borders/text resolve per theme. */
export const darkInputWrapperClassName =
  "rounded-xl border border-wn-border-strong bg-wn-surface hover:!bg-wn-surface-raised data-[hover=true]:!bg-wn-surface-raised data-[hover=true]:!border-wn-mono-600 group-data-[focus=true]:!border-wn-mono-500 group-data-[focus=true]:!bg-wn-surface";

export const darkInputClassName =
  "!text-wn-text placeholder:!text-wn-text-subtle data-[hover=true]:!text-wn-text";

/** HeroUI Input/Textarea slots for modals (no built-in label). */
export const darkFieldInputClassNames = {
  inputWrapper: darkInputWrapperClassName,
  input: darkInputClassName,
  innerWrapper: "bg-transparent data-[hover=true]:bg-transparent",
};

export const modalFieldLabelClassName = "text-sm font-medium text-wn-text";

export const modalPrimaryButtonClassName =
  "min-w-26 rounded-full border-0 bg-wn-mono-50 font-semibold text-wn-mono-950 shadow-none hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100 data-[disabled=true]:bg-wn-mono-50/40 data-[disabled=true]:text-wn-mono-950/50";

export const onboardingFieldClassNames = {
  label: "text-wn-text",
  input: darkInputClassName,
  inputWrapper: darkInputWrapperClassName,
  innerWrapper: darkFieldInputClassNames.innerWrapper,
  mainWrapper: "gap-1",
  errorMessage: "text-wn-red-400",
};
