import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "@worldnote/ui";
import { useState } from "react";

const meta = {
  title: "02-Molecules/Tabs",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Underline: Story = {
  render: function UnderlineTabs() {
    const [tab, setTab] = useState("info");
    return (
      <div className="w-[420px] rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-0">
        <Tabs
          aria-label="Inspector sections"
          variant="underline"
          selectedKey={tab}
          onSelectionChange={setTab}
          items={[
            { id: "info", label: "Info" },
            { id: "properties", label: "Properties" },
          ]}
        />
        <div className="px-4 py-3 text-sm text-wn-mono-400">
          Active tab: {tab}
        </div>
      </div>
    );
  },
};

export const Segmented: Story = {
  render: function SegmentedTabs() {
    const [tab, setTab] = useState("dark");
    return (
      <Tabs
        aria-label="Theme"
        variant="segmented"
        selectedKey={tab}
        onSelectionChange={setTab}
        items={[
          { id: "light", label: "Light" },
          { id: "dark", label: "Dark" },
          { id: "system", label: "System" },
        ]}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-wn-mono-950 p-8">
        <Story />
      </div>
    ),
  ],
};
