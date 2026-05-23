import { Button } from "@worldnote/ui";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  BoardIcon,
  CheckSquareIcon,
  ColumnsIcon,
  CommentIcon,
  ImageIcon,
  LinkIcon,
  MapPinIcon,
  PlusIcon,
  SlashIcon,
  StickyNoteIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "./icons.js";

export type CreateOption = "character" | "location";
type CreateMenuOption = CreateOption | "note" | "bond" | "group";
type RailToolType =
  | "note"
  | "link"
  | "todo"
  | "line"
  | "board"
  | "column"
  | "comment"
  | "image"
  | "upload"
  | "trash";

type SidebarProps = {
  className?: string;
  onCreate?: (type: CreateOption) => void;
};

const createMenuItems: {
  id: CreateMenuOption;
  label: string;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
}[] = [
  {
    id: "character",
    label: "Character",
    description: "Create a character card",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    id: "location",
    label: "Location",
    description: "Create a location card",
    icon: <MapPinIcon className="h-4 w-4" />,
  },
  {
    id: "note",
    label: "Note",
    description: "Coming soon",
    icon: <StickyNoteIcon className="h-4 w-4" />,
    disabled: true,
  },
  {
    id: "bond",
    label: "Bond",
    description: "Coming soon",
    icon: <LinkIcon className="h-4 w-4" />,
    disabled: true,
  },
  {
    id: "group",
    label: "Group",
    description: "Coming soon",
    icon: <BoardIcon className="h-4 w-4" />,
    disabled: true,
  },
];

const railItems: {
  id: RailToolType;
  label: string;
  icon: ReactNode;
  active?: boolean;
}[] = [
  { id: "note", label: "Note", icon: <StickyNoteIcon className="h-4 w-4" /> },
  { id: "link", label: "Link", icon: <LinkIcon className="h-4 w-4" /> },
  { id: "todo", label: "To-do", icon: <CheckSquareIcon className="h-4 w-4" /> },
  { id: "line", label: "Line", icon: <SlashIcon className="h-4 w-4" /> },
  {
    id: "board",
    label: "Board",
    icon: <BoardIcon className="h-4 w-4" />,
    active: true,
  },
  { id: "column", label: "Column", icon: <ColumnsIcon className="h-4 w-4" /> },
  {
    id: "comment",
    label: "Comment",
    icon: <CommentIcon className="h-4 w-4" />,
  },
  { id: "image", label: "Add image", icon: <ImageIcon className="h-4 w-4" /> },
  {
    id: "upload",
    label: "Upload file",
    icon: <UploadIcon className="h-4 w-4" />,
  },
];

export function Sidebar({ className, onCreate }: SidebarProps) {
  const isCreateOption = (id: CreateMenuOption): id is CreateOption =>
    id === "character" || id === "location";

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);

  const supportsCreate = useMemo(() => !!onCreate, [onCreate]);

  const handleSelectCreateOption = (option: CreateOption) => {
    setCreateMenuOpen(false);
    onCreate?.(option);
  };

  return (
    <aside
      ref={railRef}
      className={`relative flex h-full w-[74px] flex-col items-center overflow-hidden border-r border-[#e2e2e2] bg-white ${className ?? ""}`}
    >
      <div className="w-full border-b border-[#ececec] p-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-11 min-h-11 w-full rounded-xl border border-[#1d2430] bg-[#1e2532] px-0 text-wn-mono-50 data-[hover=true]:bg-[#273040]"
          onPress={() => setCreateMenuOpen((open) => !open)}
          aria-label="Create"
        >
          <span className="flex w-full flex-col items-center justify-center gap-0.5 leading-none">
            <PlusIcon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium">Create</span>
          </span>
        </Button>
      </div>

      {createMenuOpen ? (
        <div className="absolute left-[84px] top-2 z-20 w-64 rounded-xl border border-[#e1e1e1] bg-white p-2 shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
          <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-wn-mono-500">
            Create new
          </div>
          {createMenuItems.map((item) => {
            const createOption: CreateOption | null = isCreateOption(item.id)
              ? item.id
              : null;
            const canCreate = createOption !== null;
            return (
              <div key={item.id}>
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={item.disabled}
                  className="mb-1 h-auto min-h-0 w-full rounded-lg border border-transparent bg-transparent px-2 py-2 text-left text-wn-mono-800 data-[hover=true]:border-[#e7e7e7] data-[hover=true]:bg-[#f7f7f7]"
                  onPress={() => {
                    if (createOption) {
                      handleSelectCreateOption(createOption);
                    }
                  }}
                  aria-label={item.label}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-wn-mono-500">{item.icon}</span>
                    <span className="flex flex-col items-start leading-tight">
                      <span className="text-[12px] font-medium text-wn-mono-800">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-wn-mono-500">
                        {item.description}
                      </span>
                    </span>
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-2">
        {railItems.map((item) => (
          <Button
            variant="secondary"
            size="sm"
            key={item.id}
            isDisabled
            className={`h-10 min-h-10 w-full rounded-lg border px-0 ${item.active ? "border-[#cfd5e3] bg-[#eaf1ff] text-[#4a5b86]" : "border-[#e4e4e4] bg-[#fafafa] text-wn-mono-500"} data-[hover=true]:bg-[#f1f1f1]`}
            aria-label={item.label}
          >
            <span className="flex w-full flex-col items-center justify-center gap-0.5 leading-none">
              <span>{item.icon}</span>
              <span className="text-[9px]">{item.label}</span>
            </span>
          </Button>
        ))}
      </div>

      <div className="w-full border-t border-[#ececec] p-2">
        <Button
          variant="secondary"
          size="sm"
          isDisabled={!supportsCreate}
          className="h-10 min-h-10 w-full rounded-lg border border-[#e4e4e4] bg-[#fafafa] px-0 text-wn-mono-500 data-[hover=true]:bg-[#f1f1f1]"
          aria-label="Trash"
        >
          <span className="flex w-full flex-col items-center justify-center gap-0.5 leading-none">
            <TrashIcon className="h-4 w-4" />
            <span className="text-[9px]">Trash</span>
          </span>
        </Button>
      </div>
    </aside>
  );
}
