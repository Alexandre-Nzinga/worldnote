import { AnimatedPopover, fieldLabelClassName, fieldStackClassName, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { primaryAccentRingOnSurfaceClassName } from "../../services/settings/primaryAccentStyles.js";
import { surfacePanelClassName } from "../shell/pageShellStyles.js";
import {
  resolveMaterialIconPickerOptions,
  type MaterialIconPickerOption,
} from "./materialIconPickerOptions.js";
import { settingsSelectClassName } from "./settingsStyles.js";
import { useAnchoredPopoverPosition } from "./useAnchoredPopoverPosition.js";

const iconButtonClassName =
  "flex flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-wn-surface-raised";

const selectedIconButtonClassName = `bg-wn-surface-raised ${primaryAccentRingOnSurfaceClassName}`;

type MaterialIconPickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
};

function findSelectedOption(
  options: MaterialIconPickerOption[],
  value: string,
): MaterialIconPickerOption {
  const trimmed = value.trim() || "auto_awesome";
  return (
    options.find((option) => option.value === trimmed) ?? {
      value: trimmed,
      label: trimmed,
    }
  );
}

export function MaterialIconPicker({
  id,
  value,
  onChange,
  disabled = false,
  label = "Icon",
  ariaLabel = "Choose icon",
}: MaterialIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const labelId = `${listboxId}-label`;
  const popoverPosition = useAnchoredPopoverPosition(triggerRef, isOpen, 280);

  const options = useMemo(
    () => resolveMaterialIconPickerOptions(value),
    [value],
  );
  const selectedOption = useMemo(
    () => findSelectedOption(options, value),
    [options, value],
  );

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
              width: Math.max(popoverPosition.width, 240),
            }}
          >
            <AnimatedPopover isOpen={isOpen}>
              <fieldset
                id={listboxId}
                className={`${surfacePanelClassName} m-0 max-h-[min(70vh,20rem)] min-w-0 overflow-y-auto border-0 p-3 shadow-lg`}
              >
                <legend className="sr-only">{ariaLabel}</legend>
                <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
                  {options.map((option) => {
                    const isSelected = option.value === selectedOption.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={option.label}
                        disabled={disabled}
                        onClick={() => {
                          onChange(option.value);
                          close();
                        }}
                        className={`${iconButtonClassName} ${
                          isSelected ? selectedIconButtonClassName : ""
                        }`}
                      >
                        <MaterialSymbol
                          name={option.value}
                          className="text-xl text-wn-text"
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
      <span id={labelId} className={fieldLabelClassName}>
        {label}
      </span>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        onClick={() => setIsOpen((open) => !open)}
        className={`${settingsSelectClassName} text-left`}
      >
        <MaterialSymbol
          name={selectedOption.value}
          className="shrink-0 text-xl text-wn-text"
        />
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
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
