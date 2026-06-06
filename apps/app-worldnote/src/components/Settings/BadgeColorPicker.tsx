import { AnimatedPopover, fieldLabelClassName, fieldStackClassName, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BADGE_BACKGROUND_SELECT_OPTIONS,
  BADGE_TEXT_COLOR_OPTIONS,
  resolveBadgeBackgroundSwatchClass,
  resolveBadgeTextSwatchClass,
} from "../../services/settings/cardTypeBadgeSettings.js";
import { primaryAccentRingOnSurfaceClassName } from "../../services/settings/primaryAccentStyles.js";
import { surfacePanelClassName } from "../shell/pageShellStyles.js";
import { settingsSelectClassName } from "./settingsStyles.js";
import { useAnchoredPopoverPosition } from "./useAnchoredPopoverPosition.js";

const swatchClassName =
  "h-7 w-7 shrink-0 rounded-full ring-1 ring-wn-border ring-inset";

const swatchButtonClassName =
  "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-wn-surface-raised";

const selectedSwatchButtonClassName = `bg-wn-surface-raised ${primaryAccentRingOnSurfaceClassName}`;

type BadgeColorPickerKind = "background" | "text";

type BadgeColorPickerProps = {
  kind: BadgeColorPickerKind;
  cardType: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
  ariaLabel: string;
};

function resolveSwatchClass(
  kind: BadgeColorPickerKind,
  cardType: string,
  value: string,
): string {
  return kind === "background"
    ? resolveBadgeBackgroundSwatchClass(cardType, value)
    : resolveBadgeTextSwatchClass(cardType, value);
}

export function BadgeColorPicker({
  kind,
  cardType,
  value,
  onChange,
  disabled = false,
  label,
  ariaLabel,
}: BadgeColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const popoverPosition = useAnchoredPopoverPosition(triggerRef, isOpen);

  const options = useMemo(
    () =>
      kind === "background"
        ? BADGE_BACKGROUND_SELECT_OPTIONS
        : [...BADGE_TEXT_COLOR_OPTIONS],
    [kind],
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  const selectedSwatch = resolveSwatchClass(kind, cardType, value);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || rootRef.current?.contains(target)) {
        return;
      }
      const popover = document.getElementById(listboxId);
      if (popover?.contains(target)) {
        return;
      }
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, isOpen, listboxId]);

  const popover =
    isOpen && popoverPosition
      ? createPortal(
          <div
            className="fixed z-[calc(var(--z-index-modal)+1)]"
            style={{
              top: popoverPosition.top,
              bottom: popoverPosition.bottom,
              left: popoverPosition.left,
              width: popoverPosition.width,
            }}
          >
            <AnimatedPopover isOpen={isOpen}>
              <fieldset
                id={listboxId}
                className={`${surfacePanelClassName} m-0 max-h-[min(70vh,20rem)] min-w-0 overflow-y-auto border-0 p-3 shadow-lg`}
              >
                <legend className="sr-only">{ariaLabel}</legend>
                <div className="grid grid-cols-4 gap-1 sm:grid-cols-5">
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    const swatch = resolveSwatchClass(
                      kind,
                      cardType,
                      option.value,
                    );
                    return (
                      <button
                        key={option.value || "default"}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={option.label}
                        disabled={disabled}
                        onClick={() => {
                          onChange(option.value);
                          close();
                        }}
                        className={`${swatchButtonClassName} ${
                          isSelected ? selectedSwatchButtonClassName : ""
                        }`}
                      >
                        <span
                          className={`${swatchClassName} ${swatch}`}
                          aria-hidden
                        />
                        <span className="max-w-full truncate text-center text-[10px] leading-tight text-wn-text-muted">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </AnimatedPopover>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={fieldStackClassName}>
      <span id={`${listboxId}-label`} className={fieldLabelClassName}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${listboxId}-label`}
        onClick={() => setIsOpen((open) => !open)}
        className={`${settingsSelectClassName} text-left`}
      >
        <span
          className={`${swatchClassName} ${selectedSwatch}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label}</span>
        <MaterialSymbol
          name="expand_more"
          className={`shrink-0 text-lg text-wn-text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {popover}
    </div>
  );
}
