import { Select, SelectItem } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";
import { resolveOverlayContainer } from "../../../overlay/resolveOverlayContainer.js";

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

const fieldLabelClassName = "text-sm font-medium text-wn-mono-50";

const fieldTriggerClassName =
  "relative h-10 min-h-10 rounded-full border border-wn-mono-700 bg-wn-mono-950 px-3 pr-9 shadow-none data-[hover=true]:border-wn-mono-600 data-[hover=true]:bg-wn-mono-950 group-data-[focus=true]:border-wn-mono-500";

const inlineTriggerClassName =
  "relative h-8 min-h-8 max-w-40 rounded-lg border-0 bg-transparent px-2 pr-7 shadow-none data-[hover=true]:bg-wn-mono-800 group-data-[focus=true]:bg-wn-mono-800";

const fieldValueClassName =
  "w-full min-w-0 truncate text-left text-sm text-wn-mono-50 group-data-[has-value=true]:text-wn-mono-50";

const inlineValueClassName =
  "w-full min-w-0 truncate text-left text-xs text-wn-mono-400 group-data-[has-value=true]:text-wn-mono-400";

const popoverSurfaceClassName =
  "z-[250] rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-1 shadow-lg";

const listboxClassName = "max-h-60 gap-0.5 overflow-y-auto";

const itemClassName =
  "rounded-lg text-wn-mono-100 outline-none ring-0 data-[hover=true]:bg-wn-mono-700 data-[hover=true]:text-wn-mono-50 data-[focus=true]:bg-wn-mono-700 data-[focus=true]:!text-wn-mono-50 data-[focus=true]:outline data-[focus=true]:outline-2 data-[focus=true]:outline-offset-0 data-[focus=true]:outline-wn-mono-50 data-[focus-visible=true]:outline data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-0 data-[focus-visible=true]:outline-wn-mono-50 data-[selected=true]:bg-wn-mono-600 data-[selected=true]:text-wn-mono-50";

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
      className={`flex flex-col ${hideLabel ? "gap-0" : "gap-1"} ${className ?? ""}`}
    >
      {!hideLabel ? (
        <label htmlFor={id} className={fieldLabelClassName}>
          {label}
        </label>
      ) : null}
      <Select
        id={id}
        aria-label={label}
        placeholder={hasSelection ? undefined : placeholder}
        items={items}
        selectedKeys={selectedKeys}
        isDisabled={disabled}
        disallowEmptySelection={!allowEmpty}
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
          trigger: isInline ? inlineTriggerClassName : fieldTriggerClassName,
          innerWrapper: "min-w-0 flex-1",
          value: isInline ? inlineValueClassName : fieldValueClassName,
          selectorIcon: isInline
            ? "pointer-events-none absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-wn-mono-500"
            : "pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-wn-mono-400",
          popoverContent: popoverSurfaceClassName,
          listbox: listboxClassName,
          listboxWrapper: "max-h-60",
        }}
        listboxProps={{
          itemClasses: {
            base: itemClassName,
          },
        }}
        popoverProps={{
          placement: isInline ? "top" : "bottom",
          offset: 8,
          shouldFlip: true,
          portalContainer,
          classNames: {
            base: "z-[250]",
            content: popoverSurfaceClassName,
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
