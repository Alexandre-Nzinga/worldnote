import type { Preview } from "@storybook/react";
import { WorldNoteUIProvider } from "@worldnote/ui";
import "@worldnote/ui/theme/tailwind.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <WorldNoteUIProvider>
        <div className="min-h-[200px] bg-zinc-950 p-6 text-zinc-50">
          <Story />
        </div>
      </WorldNoteUIProvider>
    ),
  ],
};

export default preview;
