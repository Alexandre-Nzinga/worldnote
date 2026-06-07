import { Input } from "@heroui/react";
import { fieldStackClassName, wnDescriptionClassName, wnSubtitleClassName } from "@worldnote/ui";
import { settingsFieldInputClassNames } from "./settingsStyles.js";

type TimelineEraSuffixSettingProps = {
  value: string;
  onChange: (value: string) => void;
  worldName?: string;
  disabled?: boolean;
  /** When true, parent supplies the section title and description. */
  hideHeading?: boolean;
};

export function TimelineEraSuffixSetting({
  value,
  onChange,
  worldName,
  disabled = false,
  hideHeading = false,
}: TimelineEraSuffixSettingProps) {
  return (
    <section className={hideHeading ? "mt-4" : undefined}>
      {hideHeading ? null : (
        <div className="mb-4 flex flex-col gap-1">
          <span className={wnSubtitleClassName}>Era suffix</span>
          <p className={wnDescriptionClassName}>
            {worldName
              ? `Era suffix for ${worldName} timeline (e.g. AG).`
              : "Default era suffix for timeline years. Open a world to customize its calendar."}
          </p>
        </div>
      )}

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
