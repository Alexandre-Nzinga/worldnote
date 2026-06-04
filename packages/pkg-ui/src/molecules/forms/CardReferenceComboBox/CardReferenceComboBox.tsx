import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";
import { resolveOverlayContainer } from "../../../overlay/resolveOverlayContainer.js";

export type CardReferenceOption = {
  id: string;
  name: string;
  typeLabel: string;
};

export type CardReferenceCreateOption = {
  label: string;
  onCreate: (name: string) => void;
};

export type CardReferenceComboBoxProps = {
  id?: string;
  label: string;
  options: CardReferenceOption[];
  value: string | null;
  onSelect: (cardId: string) => void;
  onClear?: () => void;
  createOptions?: CardReferenceCreateOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Hides the visible label while keeping it for assistive tech. */
  hideLabel?: boolean;
};

const CREATE_KEY_PREFIX = "__create__:";

const fieldLabelClassName = "text-xs font-medium text-wn-text-subtle";

const inputWrapperClassName =
  "flex min-h-0 h-auto min-h-10 items-center gap-0 rounded-lg border border-wn-mono-700 bg-transparent pl-3 pr-1 shadow-none ring-0 outline-none hover:!bg-transparent data-[hover=true]:!border-wn-mono-600 data-[hover=true]:!bg-transparent group-data-[focus=true]:!border-wn-mono-50 group-data-[focus=true]:!bg-transparent group-data-[focus=true]:ring-0";

const innerWrapperClassName =
  "flex min-h-0 min-w-0 flex-1 items-center bg-transparent pe-0 data-[hover=true]:bg-transparent";

const inputClassName =
  "!pe-0 !text-sm text-wn-mono-200 placeholder:!text-wn-mono-600 data-[hover=true]:!text-wn-mono-200";

const endContentWrapperClassName =
  "!mr-0 flex h-10 w-9 shrink-0 items-center justify-center self-center p-0";

const selectorButtonClassName =
  "!m-0 flex h-full min-h-0 w-full min-w-0 items-center justify-center !rounded-none bg-transparent !p-0 text-wn-mono-500 shadow-none data-[hover=true]:bg-transparent";

const popoverSurfaceClassName =
  "z-[250] rounded-xl border-0 bg-wn-mono-900 p-1 shadow-none";

const listboxClassName = "max-h-60 gap-0.5 overflow-y-auto";

const itemClassName =
  "rounded-lg text-wn-mono-100 data-[hover=true]:bg-wn-mono-700 data-[hover=true]:text-wn-mono-50 data-[selectable=true]:focus:bg-wn-mono-700 data-[selectable=true]:focus:text-wn-mono-50 data-[selected=true]:bg-wn-mono-600 data-[selected=true]:text-wn-mono-50";

type ListItem =
  | { kind: "card"; key: string; name: string; typeLabel: string }
  | { kind: "create"; key: string; label: string; onCreate: () => void };

function filterOptions(
  options: CardReferenceOption[],
  query: string,
): CardReferenceOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options;
  }
  return options.filter(
    (option) =>
      option.name.toLowerCase().includes(normalized) ||
      option.typeLabel.toLowerCase().includes(normalized),
  );
}

/** Searchable card picker for inspector socket connections. */
export function CardReferenceComboBox({
  id,
  label,
  options,
  value,
  onSelect,
  onClear,
  createOptions = [],
  disabled = false,
  placeholder = "Search cards…",
  className,
  hideLabel = false,
}: CardReferenceComboBoxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overflowRestoreRef = useRef<{ el: HTMLElement; value: string } | null>(
    null,
  );
  const [portalContainer, setPortalContainer] = useState<HTMLElement | undefined>(
    undefined,
  );
  const [inputValue, setInputValue] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.name);
    } else if (!value) {
      setInputValue("");
    }
  }, [selectedOption, value]);

  const listItems = useMemo((): ListItem[] => {
    const filtered = filterOptions(options, inputValue);
    const items: ListItem[] = filtered.map((option) => ({
      kind: "card",
      key: option.id,
      name: option.name,
      typeLabel: option.typeLabel,
    }));

    const query = inputValue.trim();
    if (query.length > 0 && createOptions.length > 0) {
      const exactMatch = options.some(
        (option) => option.name.toLowerCase() === query.toLowerCase(),
      );
      if (!exactMatch) {
        for (const [index, create] of createOptions.entries()) {
          items.push({
            kind: "create",
            key: `${CREATE_KEY_PREFIX}${index}`,
            label: create.label.replace("{name}", query),
            onCreate: () => create.onCreate(query),
          });
        }
      }
    }

    return items;
  }, [createOptions, inputValue, options]);

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
        if (selectedOption) {
          setInputValue(selectedOption.name);
        }
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
    [releaseOverflow, selectedOption],
  );

  useEffect(() => () => releaseOverflow(), [releaseOverflow]);

  return (
    <div
      ref={rootRef}
      className={`flex flex-col ${hideLabel ? "gap-0" : "gap-1"} ${className ?? ""}`}
    >
      {hideLabel ? (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className={fieldLabelClassName}>
            {label}
          </label>
          {value && onClear && !disabled ? (
            <button
              type="button"
              className="rounded-lg p-1 text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-200"
              aria-label={`Clear ${label}`}
              onClick={() => {
                onClear();
                setInputValue("");
              }}
            >
              <MaterialSymbol name="close" className="text-base" />
            </button>
          ) : null}
        </div>
      )}
      <Autocomplete
        id={id}
        aria-label={label}
        inputValue={inputValue}
        selectedKey={value ?? null}
        items={listItems}
        isDisabled={disabled}
        allowsCustomValue
        menuTrigger="input"
        onInputChange={setInputValue}
        onOpenChange={handleOpenChange}
        onSelectionChange={(key) => {
          if (!key || key === "all") {
            return;
          }
          const keyStr = String(key);
          if (keyStr.startsWith(CREATE_KEY_PREFIX)) {
            const item = listItems.find(
              (entry) => entry.kind === "create" && entry.key === keyStr,
            );
            if (item?.kind === "create") {
              item.onCreate();
              setInputValue("");
            }
            return;
          }
          onSelect(keyStr);
          const picked = options.find((option) => option.id === keyStr);
          if (picked) {
            setInputValue(picked.name);
          }
        }}
        placeholder={placeholder}
        selectorIcon={
          <MaterialSymbol
            name="keyboard_arrow_down"
            className="text-base text-current"
          />
        }
        selectorButtonProps={{
          size: "sm",
          variant: "light",
          isIconOnly: true,
        }}
        classNames={{
          base: "w-full gap-0",
          endContentWrapper: endContentWrapperClassName,
          selectorButton: selectorButtonClassName,
          listbox: listboxClassName,
          popoverContent: popoverSurfaceClassName,
        }}
        listboxProps={{
          itemClasses: {
            base: itemClassName,
          },
          emptyContent: (
            <p className="px-2 py-1.5 text-sm text-wn-mono-500">
              No matching cards
            </p>
          ),
        }}
        popoverProps={{
          placement: "bottom",
          offset: 8,
          shouldFlip: true,
          portalContainer,
          classNames: {
            base: "z-[250]",
            content: popoverSurfaceClassName,
          },
        }}
        inputProps={{
          classNames: {
            inputWrapper: inputWrapperClassName,
            innerWrapper: innerWrapperClassName,
            input: inputClassName,
          },
        }}
      >
        {(item) => (
          <AutocompleteItem
            key={item.key}
            textValue={item.kind === "card" ? item.name : item.label}
            classNames={{
              base: itemClassName,
            }}
          >
            {item.kind === "card" ? (
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-wn-mono-50">
                  {item.name}
                </span>
                <span className="truncate text-xs text-wn-mono-500">
                  {item.typeLabel}
                </span>
              </div>
            ) : (
              <span className="text-sm text-wn-mono-50">{item.label}</span>
            )}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
}
