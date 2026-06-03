import type { Meta, StoryObj } from "@storybook/react";
import { Field, SearchField } from "@worldnote/ui";
import { useState } from "react";

const meta = {
  title: "02-Molecules/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px] rounded-2xl bg-wn-mono-950 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Username",
    placeholder: "Alexandre",
    defaultValue: "Alexandre",
  },
};

export const Search: Story = {
  render: function SearchStory() {
    const [query, setQuery] = useState("world");
    return (
      <SearchField
        label="Search"
        value={query}
        onValueChange={setQuery}
        onClear={() => setQuery("")}
      />
    );
  },
};
