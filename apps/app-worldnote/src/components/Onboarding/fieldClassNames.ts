import {
  fieldInputClassName,
  fieldInputClassNames,
  fieldInputWrapperClassName,
  fieldInnerWrapperClassName,
} from "@worldnote/ui";

/** Themed HeroUI field slots — re-exported from @worldnote/ui for app modals. */
export const darkInputWrapperClassName = fieldInputWrapperClassName;
export const darkInputClassName = fieldInputClassName;
export const darkFieldInputClassNames = fieldInputClassNames;

export const modalPrimaryButtonClassName =
  "min-w-26 rounded-full border-0 !bg-wn-primary !text-wn-primary-foreground font-semibold shadow-none hover:!bg-wn-primary-hover data-[hover=true]:!bg-wn-primary-hover disabled:opacity-100 data-[disabled=true]:opacity-100 data-[disabled=true]:!bg-wn-primary/75 data-[disabled=true]:!text-wn-primary-foreground";

export const onboardingFieldClassNames = {
  label: "text-wn-text",
  input: darkInputClassName,
  inputWrapper: darkInputWrapperClassName,
  innerWrapper: fieldInnerWrapperClassName,
  mainWrapper: "gap-1",
  errorMessage: "text-wn-red-400",
};
