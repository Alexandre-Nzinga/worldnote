import {
  ActionMenu,
  Button,
  MaterialSymbol,
  getHeadingProps,
} from "@worldnote/ui";
import { useMemo, useState } from "react";

import { formatSessionTimestamp } from "../../../services/wizard/wizardSessionStore.js";
import type { WizardSession } from "../../../services/wizard/wizardSessionTypes.js";
import { cx } from "./cx.js";

type WizardSessionTab = "active" | "archived";

type WizardSessionListProps = {
  activeSessionId: string | null;
  activeSessions: WizardSession[];
  archivedSessions: WizardSession[];
  onSelectSession: (sessionId: string) => void;
  onStartNewSession: () => void;
  onArchiveSession: (sessionId: string) => void;
  onUnarchiveSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onBack: () => void;
};

function sessionPreview(session: WizardSession): string {
  const lastMessage = [...session.messages]
    .reverse()
    .find((message) => message.content.trim().length > 0);
  if (!lastMessage) {
    return "No messages yet";
  }
  const text = lastMessage.content.trim().replace(/\s+/g, " ");
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

function SessionRow({
  session,
  isActive,
  tab,
  onSelect,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  session: WizardSession;
  isActive: boolean;
  tab: WizardSessionTab;
  onSelect: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  const menuItems = useMemo(() => {
    if (tab === "archived") {
      return [
        { id: "restore", label: "Restore", icon: <MaterialSymbol name="unarchive" className="text-base" /> },
        {
          id: "delete",
          label: "Delete",
          icon: <MaterialSymbol name="delete" className="text-base" />,
          variant: "danger" as const,
        },
      ];
    }
    return [
      { id: "archive", label: "Archive", icon: <MaterialSymbol name="archive" className="text-base" /> },
      {
        id: "delete",
        label: "Delete",
        icon: <MaterialSymbol name="delete" className="text-base" />,
        variant: "danger" as const,
      },
    ];
  }, [tab]);

  return (
    <div
      className={cx(
        "group flex items-start gap-2 rounded-xl border px-3 py-2.5 transition-colors",
        isActive
          ? "border-wn-mono-600 bg-wn-mono-800"
          : "border-wn-mono-800 bg-wn-mono-950 hover:border-wn-mono-700 hover:bg-wn-mono-900",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="line-clamp-1 text-sm font-semibold text-wn-mono-50">
          {session.title}
        </span>
        <span className="line-clamp-2 text-xs leading-relaxed text-wn-mono-400">
          {sessionPreview(session)}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-wn-mono-500">
          {formatSessionTimestamp(session.updatedAt)}
          {session.messages.length > 0
            ? ` · ${session.messages.length} messages`
            : ""}
        </span>
      </button>
      <ActionMenu
        ariaLabel={`Session actions for ${session.title}`}
        placement="bottom-end"
        items={menuItems}
        onAction={(key) => {
          if (key === "archive") onArchive();
          if (key === "restore") onUnarchive();
          if (key === "delete") onDelete();
        }}
        trigger={
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={`Actions for ${session.title}`}
            className="min-w-8 text-wn-mono-400 opacity-0 transition-opacity group-hover:opacity-100 data-[hover=true]:text-wn-mono-50"
          >
            <MaterialSymbol name="more_vert" className="text-base" />
          </Button>
        }
      />
    </div>
  );
}

export function WizardSessionList({
  activeSessionId,
  activeSessions,
  archivedSessions,
  onSelectSession,
  onStartNewSession,
  onArchiveSession,
  onUnarchiveSession,
  onDeleteSession,
  onBack,
}: WizardSessionListProps) {
  const [tab, setTab] = useState<WizardSessionTab>("active");
  const sessions = tab === "active" ? activeSessions : archivedSessions;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-semibold text-wn-mono-400 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
        >
          <MaterialSymbol name="arrow_back" className="text-sm" />
          Back to chat
        </button>
        <Button
          size="sm"
          variant="secondary"
          onPress={onStartNewSession}
          startContent={<MaterialSymbol name="edit_square" className="text-base" />}
        >
          New
        </Button>
      </div>

      <h3
        {...getHeadingProps("h6", { tone: "inverse", weight: "bold" })}
        className="mb-2"
      >
        Conversations
      </h3>

      <div className="mb-3 flex gap-1 rounded-xl bg-wn-mono-950 p-1">
        {(["active", "archived"] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            className={cx(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
              tab === entry
                ? "bg-wn-mono-800 text-wn-mono-50"
                : "text-wn-mono-500 hover:text-wn-mono-200",
            )}
          >
            {entry}
            <span className="ml-1 text-wn-mono-500">
              ({entry === "active" ? activeSessions.length : archivedSessions.length})
            </span>
          </button>
        ))}
      </div>

      <div className="scrollbar-wn flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="py-8 text-center text-xs text-wn-mono-500">
            {tab === "active"
              ? "No conversations yet. Start a new chat to begin."
              : "No archived conversations."}
          </p>
        ) : (
          sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              tab={tab}
              onSelect={() => onSelectSession(session.id)}
              onArchive={() => onArchiveSession(session.id)}
              onUnarchive={() => onUnarchiveSession(session.id)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
