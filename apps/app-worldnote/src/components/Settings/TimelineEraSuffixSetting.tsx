import { Input } from "@heroui/react";
import { fieldLabelClassName, fieldStackClassName, getBodyTextStyle } from "@worldnote/ui";
import { settingsFieldInputClassNames } from "./settingsStyles.js";

type TimelineEraSuffixSettingProps = {
  value: string;
  onChange: (value: string) => void;
  worldName?: string;
  disabled?: boolean;
};

export function TimelineEraSuffixSetting({
  value,
  onChange,
  worldName,
  disabled = false,
}: TimelineEraSuffixSettingProps) {
  return (
    <section className="mt-4">
      <div className="mb-4 flex flex-col gap-1">
        <span className={fieldLabelClassName}>Era suffix</span>
        <p style={getBodyTextStyle("small")}>
          {worldName
            ? `Suffix for year labels in ${worldName} (e.g. AG → 10191 AG).`
            : "Default suffix for year labels on the timeline axis (e.g. AG → 10191 AG). Open a world from the canvas to edit a specific world's calendar."}
        </p>
      </div>

      <div className={fieldStackClassName}>
        <Input
          aria-label="Era suffix"
          value={value}
          onValueChange={onChange}
          placeholder="AG"
          isDisabled={disabled}
          classNames={settingsFieldInputClassNames}
        />
      </div>
    </section>
  );
}
