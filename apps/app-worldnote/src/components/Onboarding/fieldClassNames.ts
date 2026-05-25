/** Dark-surface HeroUI field slots — keeps hover/focus on wn-mono scale for readable text. */
export const darkInputWrapperClassName =
  "rounded-xl border border-wn-mono-700 bg-wn-mono-900 hover:!bg-wn-mono-800 data-[hover=true]:!bg-wn-mono-800 data-[hover=true]:!border-wn-mono-600 group-data-[focus=true]:!border-wn-mono-500 group-data-[focus=true]:!bg-wn-mono-900";

export const darkInputClassName =
  "!text-wn-mono-50 placeholder:!text-wn-mono-500 data-[hover=true]:!text-wn-mono-50";

/** HeroUI Input/Textarea slots for dark modals (no built-in label). */
export const darkFieldInputClassNames = {
  inputWrapper: darkInputWrapperClassName,
  input: darkInputClassName,
  innerWrapper: "bg-transparent data-[hover=true]:bg-transparent",
};

export const modalFieldLabelClassName = "text-sm font-medium text-wn-mono-50";

export const modalPrimaryButtonClassName =
  "min-w-26 rounded-full border-0 bg-wn-mono-50 font-semibold text-wn-mono-950 shadow-none hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100 data-[disabled=true]:bg-wn-mono-50/40 data-[disabled=true]:text-wn-mono-950/50";

export const onboardingFieldClassNames = {
  label: "text-wn-mono-50",
  input: darkInputClassName,
  inputWrapper: darkInputWrapperClassName,
  innerWrapper: darkFieldInputClassNames.innerWrapper,
  mainWrapper: "gap-1",
  errorMessage: "text-wn-red-400",
};
