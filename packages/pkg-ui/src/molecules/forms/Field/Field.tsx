import { Input } from "@heroui/react";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";
import {
  fieldClearButtonClassName,
  fieldInputClassName,
  fieldInputClassNames,
  fieldLabelClassName,
  fieldStackClassName,
} from "../fieldStyles.js";

export type FieldProps = Omit<
  ComponentProps<typeof Input>,
  "classNames" | "label"
> & {
  label?: ReactNode;
  /** Additional classes merged into the input wrapper slot. */
  wrapperClassName?: string;
  classNames?: ComponentProps<typeof Input>["classNames"];
};

/** Themed text field wrapping HeroUI Input with WorldNote tokens. */
export function Field({
  label,
  id,
  wrapperClassName,
  classNames,
  className,
  ...props
}: FieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className={clsx(fieldStackClassName, wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className={fieldLabelClassName}>
          {label}
        </label>
      ) : null}
      <Input
        id={inputId}
        classNames={{
          ...fieldInputClassNames,
          ...classNames,
          inputWrapper: clsx(
            fieldInputClassNames.inputWrapper,
            classNames?.inputWrapper,
          ),
        }}
        className={className}
        {...props}
      />
    </div>
  );
}

export type SearchFieldProps = Omit<FieldProps, "type" | "startContent"> & {
  onClear?: () => void;
  showClearButton?: boolean;
};

/** Search input with leading icon and optional clear affordance. */
export function SearchField({
  placeholder = "Search…",
  value,
  onClear,
  showClearButton = true,
  ...props
}: SearchFieldProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <Field
      type="search"
      placeholder={placeholder}
      value={value}
      startContent={
        <MaterialSymbol
          name="search"
          className="pointer-events-none text-wn-mono-500"
        />
      }
      endContent={
        showClearButton && hasValue && onClear ? (
          <button
            type="button"
            aria-label="Clear search"
            className={fieldClearButtonClassName}
            onClick={onClear}
          >
            <MaterialSymbol name="close" className="text-base" />
          </button>
        ) : undefined
      }
      classNames={{
        input: clsx(fieldInputClassName, "pl-1"),
      }}
      {...props}
    />
  );
}
