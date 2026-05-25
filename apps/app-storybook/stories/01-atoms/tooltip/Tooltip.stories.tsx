import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "@worldnote/ui";

const meta = {
  title: "01-Atoms/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    content: { control: "text" },
    label: { control: "text" },
    placement: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
    },
    showArrow: { control: "boolean" },
    offset: { control: "number" },
    isDisabled: { control: "boolean" },
  },
  args: {
    content: "This is a tooltip",
    label: "Hover or focus me",
    placement: "top",
    showArrow: true,
    offset: 10,
    isDisabled: false,
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-wn-mono-50 p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InlineDot: Story = {
  args: {
    content: "This is a tooltip",
    label: undefined,
  },
  render: (args) => (
    <Tooltip {...args} content={args.content}>
      <button
        type="button"
        aria-label="More information"
        className="inline-block h-2 w-2 rounded-full bg-wn-indigo-500 outline-none focus-visible:ring-2 focus-visible:ring-wn-indigo-500 focus-visible:ring-offset-2"
      />
    </Tooltip>
  ),
};

export const AnchorTop: Story = {
  args: {
    placement: "top",
    content: "This is a tooltip",
  },
};

export const AnchorBottom: Story = {
  args: {
    placement: "bottom",
    content: "This is a tooltip",
  },
};

export const AnchorLeft: Story = {
  args: {
    placement: "left",
    content: "This is a tooltip",
  },
};

export const AnchorRight: Story = {
  args: {
    placement: "right",
    content: "This is a tooltip",
  },
};

export const LongContent: Story = {
  args: {
    content:
      "This tooltip contains a longer message that wraps across multiple lines when space is limited, so you can preview how dense help text behaves.",
    classNames: {
      base: "max-w-xs text-left",
    },
  },
};
