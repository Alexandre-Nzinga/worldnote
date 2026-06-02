import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export type MentionListItem = {
  id: string;
  label: string;
};

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type MentionListProps = {
  items: MentionListItem[];
  command: (item: MentionListItem) => void;
};

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  function MentionList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-3 py-2 text-sm text-wn-mono-500 shadow-lg">
          No cards found
        </div>
      );
    }

    return (
      <div className="max-h-48 overflow-y-auto rounded-xl border border-wn-mono-700 bg-wn-mono-900 py-1 shadow-lg">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`block w-full px-3 py-1.5 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-wn-mono-800 text-wn-mono-50"
                : "text-wn-mono-200 hover:bg-wn-mono-800/60"
            }`}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  },
);
