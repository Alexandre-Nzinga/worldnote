import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialSymbol } from "../../../atoms/MaterialSymbol/MaterialSymbol.js";
import { resolveOverlayContainer } from "../../../overlay/resolveOverlayContainer.js";
import {
  comboboxHeaderItemClassName,
  comboboxInputWrapperClassName,
  fieldClearButtonClassName,
  fieldInputClassName,
  fieldInnerWrapperClassName,
  fieldLabelClassName,
  fieldLabelRowClassName,
  fieldStackClassName,
  selectItemClassName,
  selectListboxClassName,
  selectPopoverClassName,
} from "../fieldStyles.js";

export type CardReferenceOption = {
  id: string;
  name: string;
  typeLabel: string;
  typeIcon?: string;
  badgeClassName?: string;
  badgeTextColor?: string;
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
  /** Shown at the top when the search field is empty. */
  recentSuggestions?: CardReferenceOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Hides the visible label while keeping it for assistive tech. */
  hideLabel?: boolean;
  /** Override label typography (e.g. inspector subtle labels). */
  labelClassName?: string;
};

const CREATE_KEY_PREFIX = "__create__:";
const HEADER_KEY_PREFIX = "__header__:";

type CardListItemFields = {
  name: string;
  typeLabel: string;
  typeIcon?: string;
  badgeClassName?: string;
  badgeTextColor?: string;
};

type ListItem =
  | ({ kind: "card"; key: string } & CardListItemFields)
  | { kind: "header"; key: string; label: string }
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

function toCardListItem(option: CardReferenceOption): ListItem {
  return {
    kind: "card",
    key: option.id,
    name: option.name,
    typeLabel: option.typeLabel,
    typeIcon: option.typeIcon,
    badgeClassName: option.badgeClassName,
    badgeTextColor: option.badgeTextColor,
  };
}

function buildListItems(
  options: CardReferenceOption[],
  recentSuggestions: CardReferenceOption[],
  inputValue: string,
  createOptions: CardReferenceCreateOption[],
): ListItem[] {
  const query = inputValue.trim();
  const filtered = filterOptions(options, inputValue);
  const items: ListItem[] = [];

  if (!query && recentSuggestions.length > 0) {
    items.push({
      kind: "header",
      key: `${HEADER_KEY_PREFIX}recent`,
      label: "Recently linked",
    });
    for (const option of recentSuggestions) {
      items.push(toCardListItem(option));
    }
    const recentIds = new Set(recentSuggestions.map((option) => option.id));
    const remaining = filtered.filter((option) => !recentIds.has(option.id));
    if (remaining.length > 0) {
      items.push({
        kind: "header",
        key: `${HEADER_KEY_PREFIX}all`,
        label: "All cards",
      });
      for (const option of remaining) {
        items.push(toCardListItem(option));
      }
    }
  } else {
    for (const option of filtered) {
      items.push(toCardListItem(option));
    }
  }

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
}

function CardTypeIconBadge({
  typeIcon,
  badgeClassName,
  badgeTextColor,
}: {
  typeIcon?: string;
  badgeClassName?: string;
  badgeTextColor?: string;
}) {
  if (!typeIcon) {
    return null;
  }
  const badgeClass = badgeClassName ?? "bg-wn-mono-700";
  const textClass = badgeTextColor ?? "text-wn-mono-50";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${badgeClass}`}
      aria-hidden
    >
      <MaterialSymbol name={typeIcon} className={`text-base ${textClass}`} />
    </span>
  );
}

function CardOptionRow({
  name,
  typeLabel,
  typeIcon,
  badgeClassName,
  badgeTextColor,
}: CardListItemFields) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <CardTypeIconBadge
        typeIcon={typeIcon}
        badgeClassName={badgeClassName}
        badgeTextColor={badgeTextColor}
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm text-wn-mono-50">{name}</span>
        <span className="truncate text-xs text-wn-mono-500">{typeLabel}</span>
      </div>
    </div>
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
  recentSuggestions = [],
  disabled = false,
  placeholder = "Search cards…",
  className,
  hideLabel = false,
  labelClassName = fieldLabelClassName,
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

  const listItems = useMemo(
    () => buildListItems(options, recentSuggestions, inputValue, createOptions),
    [createOptions, inputValue, options, recentSuggestions],
  );

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
      className={`${fieldStackClassName} ${hideLabel ? "gap-0" : ""} ${className ?? ""}`}
    >
      {hideLabel ? (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      ) : (
        <div className={fieldLabelRowClassName}>
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
          {value && onClear && !disabled ? (
            <button
              type="button"
              className={fieldClearButtonClassName}
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
          if (keyStr.startsWith(HEADER_KEY_PREFIX)) {
            return;
          }
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
        startContent={
          selectedOption?.typeIcon ? (
            <CardTypeIconBadge
              typeIcon={selectedOption.typeIcon}
              badgeClassName={selectedOption.badgeClassName}
              badgeTextColor={selectedOption.badgeTextColor}
            />
          ) : null
        }
        classNames={{
          base: "w-full gap-0",
          endContentWrapper: "hidden",
          selectorButton: "hidden",
          listbox: selectListboxClassName,
          popoverContent: selectPopoverClassName,
        }}
        listboxProps={{
          itemClasses: {
            base: selectItemClassName,
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
            content: selectPopoverClassName,
          },
        }}
        inputProps={{
          classNames: {
            inputWrapper: comboboxInputWrapperClassName,
            innerWrapper: `${fieldInnerWrapperClassName} pe-0`,
            input: `${fieldInputClassName} !pe-0`,
          },
        }}
      >
        {(item) => {
          if (item.kind === "header") {
            return (
              <AutocompleteItem
                key={item.key}
                textValue={item.label}
                isDisabled
                classNames={{
                  base: comboboxHeaderItemClassName,
                }}
              >
                <span className="text-wn-xs font-medium uppercase tracking-wide text-wn-mono-500">
                  {item.label}
                </span>
              </AutocompleteItem>
            );
          }

          return (
            <AutocompleteItem
              key={item.key}
              textValue={item.kind === "card" ? item.name : item.label}
              classNames={{
                base: selectItemClassName,
              }}
            >
              {item.kind === "card" ? (
                <CardOptionRow
                  name={item.name}
                  typeLabel={item.typeLabel}
                  typeIcon={item.typeIcon}
                  badgeClassName={item.badgeClassName}
                  badgeTextColor={item.badgeTextColor}
                />
              ) : (
                <span className="text-sm text-wn-mono-50">{item.label}</span>
              )}
            </AutocompleteItem>
          );
        }}
      </Autocomplete>
    </div>
  );
}
