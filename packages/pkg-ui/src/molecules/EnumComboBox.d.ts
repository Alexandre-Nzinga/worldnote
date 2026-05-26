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
};
/** Dark enum picker styled like HeroUI ComboBox (Select until HeroUI v3 migration). */
export declare function EnumComboBox({ id, label, value, options, onChange, disabled, placeholder, allowEmpty, className, }: EnumComboBoxProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=EnumComboBox.d.ts.map