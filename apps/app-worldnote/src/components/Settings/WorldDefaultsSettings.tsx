import { UnitSystemSetting } from "./UnitSystemSetting.js";

type WorldDefaultsSettingsProps = {
  disabled?: boolean;
};

/** App-wide conventions that apply regardless of optional modules. */
export function WorldDefaultsSettings({
  disabled = false,
}: WorldDefaultsSettingsProps) {
  return <UnitSystemSetting disabled={disabled} />;
}
