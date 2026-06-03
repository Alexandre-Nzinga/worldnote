import type { Meta, StoryObj } from "@storybook/react";
import { Tag, TagGroup } from "@worldnote/ui";
import { useState } from "react";

const meta = {
  title: "01-Atoms/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    children: "Website",
    tone: "mono-dark",
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InteractiveCluster: Story = {
  render: function InteractiveClusterStory() {
    const [selected, setSelected] = useState(new Set(["website"]));
    const tags = [
      { id: "website", label: "Website" },
      { id: "wireframe", label: "Wireframe" },
      { id: "landing", label: "Landing page" },
      { id: "dashboard", label: "Dashboard" },
    ];

    return (
      <TagGroup aria-label="Service tags">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            interactive
            selected={selected.has(tag.id)}
            onPress={() => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (next.has(tag.id)) {
                  next.delete(tag.id);
                } else {
                  next.add(tag.id);
                }
                return next;
              });
            }}
          >
            {tag.label}
          </Tag>
        ))}
      </TagGroup>
    );
  },
};
