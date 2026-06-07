import { WorldCardSchema } from "@worldnote/shared";
import type {
  StoredWizardMessage,
  WizardSession,
  WizardSessionsStore,
  WizardSessionStatus,
} from "./wizardSessionTypes.js";
import type { WizardContextScope } from "./worldContext.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContextScope(value: unknown): value is WizardContextScope {
  return value === "world" || value === "focused";
}

function isSessionStatus(value: unknown): value is WizardSessionStatus {
  return value === "active" || value === "archived";
}

function parseStoredMessage(raw: unknown): StoredWizardMessage | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || raw.id.length === 0) return null;
  if (raw.role !== "user" && raw.role !== "assistant") return null;
  if (typeof raw.content !== "string") return null;

  const message: StoredWizardMessage = {
    id: raw.id,
    role: raw.role,
    content: raw.content,
  };

  if (typeof raw.error === "boolean") {
    message.error = raw.error;
  }

  if (raw.generatedCard !== undefined) {
    const parsedCard = WorldCardSchema.safeParse(raw.generatedCard);
    if (parsedCard.success) {
      message.generatedCard = parsedCard.data;
    }
  }

  if (
    raw.generatedCardAction === "spawn" ||
    raw.generatedCardAction === "apply"
  ) {
    message.generatedCardAction = raw.generatedCardAction;
  }

  return message;
}

function parseSession(raw: unknown): WizardSession | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || raw.id.length === 0) return null;
  if (typeof raw.title !== "string") return null;
  if (typeof raw.createdAt !== "number") return null;
  if (typeof raw.updatedAt !== "number") return null;
  if (!isSessionStatus(raw.status)) return null;
  if (!isContextScope(raw.contextScope)) return null;
  if (!Array.isArray(raw.droppedCardIds)) return null;
  if (!Array.isArray(raw.messages)) return null;

  const droppedCardIds = raw.droppedCardIds.filter(
    (entry): entry is string => typeof entry === "string",
  );
  const messages = raw.messages.flatMap((entry) => {
    const parsed = parseStoredMessage(entry);
    return parsed ? [parsed] : [];
  });

  return {
    id: raw.id,
    title: raw.title,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    status: raw.status,
    droppedCardIds,
    contextScope: raw.contextScope,
    messages,
  };
}

export function emptyWizardSessionsStore(): WizardSessionsStore {
  return {
    version: 1,
    activeSessionId: null,
    sessions: [],
  };
}

export function normalizeWizardSessionsStore(
  raw: unknown,
): WizardSessionsStore {
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.sessions)) {
    return emptyWizardSessionsStore();
  }

  const sessions = raw.sessions.flatMap((entry) => {
    const parsed = parseSession(entry);
    return parsed ? [parsed] : [];
  });

  const activeSessionId =
    typeof raw.activeSessionId === "string" &&
    sessions.some((session) => session.id === raw.activeSessionId)
      ? raw.activeSessionId
      : (sessions.find((session) => session.status === "active")?.id ?? null);

  return {
    version: 1,
    activeSessionId,
    sessions,
  };
}

export function deriveSessionTitle(messages: StoredWizardMessage[]): string {
  const firstUser = messages.find(
    (message) => message.role === "user" && message.content.trim().length > 0,
  );
  if (!firstUser) {
    return "New conversation";
  }
  const text = firstUser.content.trim().replace(/\s+/g, " ");
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function createWizardSession(
  options?: Partial<
    Pick<WizardSession, "droppedCardIds" | "contextScope" | "messages">
  >,
): WizardSession {
  const now = Date.now();
  const messages = options?.messages ?? [];
  return {
    id: crypto.randomUUID(),
    title: deriveSessionTitle(messages),
    createdAt: now,
    updatedAt: now,
    status: "active",
    droppedCardIds: options?.droppedCardIds ?? [],
    contextScope: options?.contextScope ?? "world",
    messages,
  };
}

export function sortSessionsByRecent(
  sessions: WizardSession[],
): WizardSession[] {
  return [...sessions].sort((left, right) => right.updatedAt - left.updatedAt);
}

export function activeWizardSessions(
  store: WizardSessionsStore,
): WizardSession[] {
  return sortSessionsByRecent(
    store.sessions.filter((session) => session.status === "active"),
  );
}

export function archivedWizardSessions(
  store: WizardSessionsStore,
): WizardSession[] {
  return sortSessionsByRecent(
    store.sessions.filter((session) => session.status === "archived"),
  );
}

export function findWizardSession(
  store: WizardSessionsStore,
  sessionId: string,
): WizardSession | undefined {
  return store.sessions.find((session) => session.id === sessionId);
}

export function upsertWizardSession(
  store: WizardSessionsStore,
  session: WizardSession,
): WizardSessionsStore {
  const index = store.sessions.findIndex((entry) => entry.id === session.id);
  const sessions =
    index === -1
      ? [...store.sessions, session]
      : store.sessions.map((entry, entryIndex) =>
          entryIndex === index ? session : entry,
        );
  return { ...store, sessions };
}

export function removeWizardSession(
  store: WizardSessionsStore,
  sessionId: string,
): WizardSessionsStore {
  const sessions = store.sessions.filter((session) => session.id !== sessionId);
  const activeSessionId =
    store.activeSessionId === sessionId
      ? (sessions.find((session) => session.status === "active")?.id ?? null)
      : store.activeSessionId;
  return { ...store, sessions, activeSessionId };
}

export function setWizardSessionStatus(
  store: WizardSessionsStore,
  sessionId: string,
  status: WizardSessionStatus,
): WizardSessionsStore {
  return {
    ...store,
    sessions: store.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, updatedAt: Date.now(), status }
        : session,
    ),
  };
}

export function formatSessionTimestamp(updatedAt: number): string {
  const diffMs = Date.now() - updatedAt;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes}m ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMs / day);
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(updatedAt).toLocaleDateString();
}
