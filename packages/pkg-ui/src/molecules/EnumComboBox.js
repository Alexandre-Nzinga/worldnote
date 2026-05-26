import { jsx as _jsx } from "react/jsx-runtime";
import { Select, SelectItem } from "@heroui/react";
const fieldLabelClassName = "text-sm font-medium text-wn-mono-50";
const triggerClassName = "h-10 min-h-10 rounded-full border border-wn-mono-700 bg-wn-mono-950 shadow-none data-[hover=true]:border-wn-mono-600 data-[hover=true]:bg-wn-mono-950 group-data-[focus=true]:border-wn-mono-500";
const valueClassName = "text-sm text-wn-mono-50 group-data-[has-value=true]:text-wn-mono-50";
const popoverClassName = "rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-1 shadow-lg";
const listboxClassName = "max-h-60 gap-0.5";
const itemClassName = "rounded-lg text-wn-mono-50 data-[hover=true]:bg-wn-mono-300 data-[hover=true]:text-wn-mono-950 data-[selectable=true]:focus:bg-wn-mono-300 data-[selectable=true]:focus:text-wn-mono-950 data-[selected=true]:bg-wn-mono-300 data-[selected=true]:text-wn-mono-950";
/** Dark enum picker styled like HeroUI ComboBox (Select until HeroUI v3 migration). */
export function EnumComboBox({ id, label, value, options, onChange, disabled = false, placeholder = "Select…", allowEmpty = false, className, }) {
    const items = allowEmpty
        ? [{ value: "", label: "—" }, ...options]
        : options;
    const selectedKeys = value ? [value] : [];
    return (_jsx(Select, { id: id, "aria-label": label, label: label, labelPlacement: "outside", placeholder: placeholder, items: items, selectedKeys: selectedKeys, isDisabled: disabled, disallowEmptySelection: !allowEmpty, onSelectionChange: (keys) => {
            if (keys === "all") {
                return;
            }
            const next = Array.from(keys)[0];
            onChange(next ? String(next) : "");
        }, className: className, classNames: {
            label: fieldLabelClassName,
            trigger: triggerClassName,
            value: valueClassName,
            selectorIcon: "text-wn-mono-400",
            popoverContent: popoverClassName,
            listbox: listboxClassName,
        }, listboxProps: {
            itemClasses: {
                base: itemClassName,
            },
        }, popoverProps: {
            placement: "top",
            offset: 8,
            classNames: {
                content: popoverClassName,
            },
        }, children: (item) => (_jsx(SelectItem, { textValue: item.label, children: item.label }, item.value)) }));
}
