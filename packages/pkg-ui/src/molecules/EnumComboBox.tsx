import { Select, SelectItem } from "@heroui/react";

export type EnumComboBoxOption = {
  value: string;
  label: string;
};

export type EnumComboBoxProps = {
  id?: string;
  label: string;
  value: string;
  options: EnumComboBoxOption[];
  onChange: (value: string) => void;
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

const fieldLabelClassName = "text-sm font-medium text-wn-mono-50";

const fieldTriggerClassName =
  "relative h-10 min-h-10 rounded-full border border-wn-mono-700 bg-wn-mono-950 px-3 pr-9 shadow-none data-[hover=true]:border-wn-mono-600 data-[hover=true]:bg-wn-mono-950 group-data-[focus=true]:border-wn-mono-500";

const inlineTriggerClassName =
  "relative h-8 min-h-8 max-w-40 rounded-lg border-0 bg-transparent px-2 pr-7 shadow-none data-[hover=true]:bg-wn-mono-800 group-data-[focus=true]:bg-wn-mono-800";

const fieldValueClassName =
  "w-full min-w-0 truncate text-left text-sm text-wn-mono-50 group-data-[has-value=true]:text-wn-mono-50";

const inlineValueClassName =
  "w-full min-w-0 truncate text-left text-xs text-wn-mono-400 group-data-[has-value=true]:text-wn-mono-400";

const popoverClassName =
  "rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-1 shadow-lg";

const listboxClassName = "max-h-60 gap-0.5";

const itemClassName =
  "rounded-lg text-wn-mono-50 data-[hover=true]:bg-wn-mono-300 data-[hover=true]:text-wn-mono-950 data-[selectable=true]:focus:bg-wn-mono-300 data-[selectable=true]:focus:text-wn-mono-950 data-[selected=true]:bg-wn-mono-300 data-[selected=true]:text-wn-mono-950";

/** Dark enum picker styled like HeroUI ComboBox (Select until HeroUI v3 migration). */
export function EnumComboBox({
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
}: EnumComboBoxProps) {
  const items: EnumComboBoxOption[] = allowEmpty
    ? [{ value: "", label: "—" }, ...options]
    : options;

  const selectedKeys = value ? [value] : [];
  const hasSelection = value.length > 0;
  const isInline = variant === "inline";

  return (
    <div className={`flex flex-col ${hideLabel ? "gap-0" : "gap-1"} ${className ?? ""}`}>
      {!hideLabel ? (
        <label htmlFor={id} className={fieldLabelClassName}>
          {label}
        </label>
      ) : null}
      <Select
        id={id}
        aria-label={label}
        label={hideLabel ? undefined : label}
        placeholder={hasSelection ? undefined : placeholder}
        items={items}
        selectedKeys={selectedKeys}
        isDisabled={disabled}
        disallowEmptySelection={!allowEmpty}
        renderValue={(selected) => {
          const item = selected[0];
          if (!item) {
            return null;
          }
          const data = item.data as EnumComboBoxOption | undefined;
          return (
            <span className="block w-full truncate text-left">
              {data?.label ?? item.textValue}
            </span>
          );
        }}
        onSelectionChange={(keys) => {
          if (keys === "all") {
            return;
          }
          const next = Array.from(keys)[0];
          onChange(next ? String(next) : "");
        }}
        classNames={{
          base: isInline ? "w-auto min-w-0 max-w-40 gap-0" : "w-full gap-0",
          label: hideLabel ? "hidden" : undefined,
          trigger: isInline ? inlineTriggerClassName : fieldTriggerClassName,
          innerWrapper: "min-w-0 flex-1",
          value: isInline ? inlineValueClassName : fieldValueClassName,
          selectorIcon: isInline
            ? "pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-base text-wn-mono-500"
            : "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-wn-mono-400",
          popoverContent: popoverClassName,
          listbox: listboxClassName,
        }}
        listboxProps={{
          itemClasses: {
            base: itemClassName,
          },
        }}
        popoverProps={{
          placement: "top",
          offset: 8,
          classNames: {
            content: popoverClassName,
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
