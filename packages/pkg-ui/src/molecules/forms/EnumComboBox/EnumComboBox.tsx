import { Select, SelectItem } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";
import { resolveOverlayContainer } from "../../../overlay/resolveOverlayContainer.js";
import {
  fieldClearButtonClassName,
  wnLabelClassName,
  fieldLabelRowClassName,
  fieldStackClassName,
  selectInlineSelectorIconClassName,
  selectInlineTriggerClassName,
  selectInlineValueClassName,
  selectItemClassName,
  selectListboxClassName,
  selectPopoverClassName,
  selectSelectorIconClassName,
  selectTriggerClassName,
  selectValueClassName,
} from "../fieldStyles.js";

export type EnumComboBoxOption<V extends string = string> = {
  value: V;
  label: string;
};

export type EnumComboBoxValue<V extends string> = V | "";

export type EnumComboBoxProps<V extends string = string> = {
  id?: string;
  label: string;
  value: EnumComboBoxValue<V>;
  options: readonly EnumComboBoxOption<V>[];
  onChange: (value: EnumComboBoxValue<V>) => void;
  disabled?: boolean;
  placeholder?: string;
  /** When true, adds an em-dash empty option at the top. */
  allowEmpty?: boolean;
  className?: string;
  /** Hides the visible label while keeping it for assistive tech. */
  hideLabel?: boolean;
  /** Override label typography (e.g. inspector subtle labels). */
  labelClassName?: string;
  /** Shows a clear control when a value is selected. Defaults to true for `field` variant. */
  clearable?: boolean;
  /** Compact trigger for toolbars and inline controls. */
  variant?: "field" | "inline";
};

function labelFromOptionData(data: unknown): string | undefined {
  if (
    data &&
    typeof data === "object" &&
    "label" in data &&
    typeof data.label === "string"
  ) {
    return data.label;
  }
  return undefined;
}

/** Dark enum picker styled like HeroUI ComboBox (Select until HeroUI v3 migration). */
export function EnumComboBox<V extends string = string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select…",
  allowEmpty = false,
  className,
  hideLabel = false,
  labelClassName = wnLabelClassName,
  clearable,
  variant = "field",
}: EnumComboBoxProps<V>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overflowRestoreRef = useRef<{ el: HTMLElement; value: string } | null>(
    null,
  );
  const [portalContainer, setPortalContainer] = useState<HTMLElement | undefined>(
    undefined,
  );

  const emptyOption: EnumComboBoxOption<EnumComboBoxValue<V>> = {
    value: "",
    label: "—",
  };
  const items: readonly EnumComboBoxOption<EnumComboBoxValue<V>>[] = allowEmpty
    ? [emptyOption, ...options]
    : options;

  const selectedKeys = value ? [value] : [];
  const hasSelection = value.length > 0;
  const isInline = variant === "inline";
  const isClearable = clearable ?? (!isInline && !hideLabel);
  const canClear = isClearable && hasSelection && !disabled;
  const allowsEmptySelection = allowEmpty || isClearable;

  const releaseOverflow = useCallback(() => {
    const saved = overflowRestoreRef.current;
    if (saved) {
      saved.el.style.overflow = saved.value;
      overflowRestoreRef.current = null;
    }
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        releaseOverflow();
        return;
      }
      const container = resolveOverlayContainer(rootRef.current);
      setPortalContainer(container);
      if (container && container !== document.body) {
        overflowRestoreRef.current = {
          el: container,
          value: container.style.overflow,
        };
        container.style.overflow = "visible";
      }
    },
    [releaseOverflow],
  );

  useEffect(() => () => releaseOverflow(), [releaseOverflow]);

  return (
    <div
      ref={rootRef}
      className={`${fieldStackClassName} ${hideLabel ? "gap-0" : ""} ${className ?? ""}`}
    >
      {!hideLabel ? (
        <div className={fieldLabelRowClassName}>
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
          {canClear ? (
            <button
              type="button"
              className={fieldClearButtonClassName}
              aria-label={`Clear ${label}`}
              onClick={() => onChange("")}
            >
              <MaterialSymbol name="close" className="text-base" />
            </button>
          ) : null}
        </div>
      ) : null}
      <Select
        id={id}
        aria-label={label}
        placeholder={hasSelection ? undefined : placeholder}
        items={items}
        selectedKeys={selectedKeys}
        isDisabled={disabled}
        disallowEmptySelection={!allowsEmptySelection}
        selectorIcon={
          <MaterialSymbol
            name="keyboard_arrow_down"
            className="text-base text-current"
          />
        }
        onOpenChange={handleOpenChange}
        renderValue={(selected) => {
          const item = selected[0];
          if (!item) {
            return null;
          }
          const optionLabel = labelFromOptionData(item.data);
          return (
            <span className="block w-full truncate text-left">
              {optionLabel ?? item.textValue}
            </span>
          );
        }}
        onSelectionChange={(keys) => {
          if (keys === "all") {
            return;
          }
          const next = Array.from(keys)[0];
          if (!next) {
            onChange("");
            return;
          }
          const nextValue = String(next);
          if (allowEmpty && nextValue === "") {
            onChange("");
            return;
          }
          const matched = options.find((option) => option.value === nextValue);
          if (matched) {
            onChange(matched.value);
          }
        }}
        classNames={{
          base: isInline ? "w-auto min-w-0 max-w-40 gap-0" : "w-full gap-0",
          label: "hidden",
          trigger: isInline ? selectInlineTriggerClassName : selectTriggerClassName,
          innerWrapper: "min-w-0 flex-1",
          value: isInline ? selectInlineValueClassName : selectValueClassName,
          selectorIcon: isInline
            ? selectInlineSelectorIconClassName
            : selectSelectorIconClassName,
          popoverContent: selectPopoverClassName,
          listbox: selectListboxClassName,
          listboxWrapper: "max-h-60",
        }}
        listboxProps={{
          itemClasses: {
            base: selectItemClassName,
          },
        }}
        popoverProps={{
          placement: isInline ? "top" : "bottom",
          offset: 8,
          shouldFlip: true,
          portalContainer,
          classNames: {
            base: "z-[250]",
            content: selectPopoverClassName,
          },
        }}
      >
        {(item) => (
          <SelectItem key={item.value} textValue={item.label}>
            {item.label}
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
