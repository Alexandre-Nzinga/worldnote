import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  loadWizardSessions,
  saveWizardSessions,
} from "../../../services/wizard/wizardSessionCommands.js";
import {
  activeWizardSessions,
  archivedWizardSessions,
  createWizardSession,
  deriveSessionTitle,
  emptyWizardSessionsStore,
  findWizardSession,
  removeWizardSession,
  setWizardSessionStatus,
  upsertWizardSession,
} from "../../../services/wizard/wizardSessionStore.js";
import type {
  StoredWizardMessage,
  WizardSession,
  WizardSessionsStore,
} from "../../../services/wizard/wizardSessionTypes.js";
import type { WizardContextScope } from "../../../services/wizard/worldContext.js";

const SAVE_DEBOUNCE_MS = 400;

export type ActiveWizardSessionPatch = {
  messages: StoredWizardMessage[];
  droppedCardIds: string[];
  contextScope: WizardContextScope;
};

type UseWizardSessionsArgs = {
  vaultPath: string;
  isOpen: boolean;
};

export function useWizardSessions({
  vaultPath,
  isOpen,
}: UseWizardSessionsArgs) {
  const [store, setStore] = useState<WizardSessionsStore>(
    emptyWizardSessionsStore(),
  );
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (next: WizardSessionsStore) => {
      if (!vaultPath) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        void saveWizardSessions(vaultPath, next).catch(() => {
          // best-effort persistence
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [vaultPath],
  );

  const commitStore = useCallback(
    (updater: (current: WizardSessionsStore) => WizardSessionsStore) => {
      setStore((current) => {
        const next = updater(current);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    if (!isOpen || !vaultPath) {
      setLoaded(false);
      return;
    }

    let cancelled = false;
    setLoaded(false);
    void loadWizardSessions(vaultPath).then((loadedStore) => {
      if (cancelled) return;
      setStore(loadedStore);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, vaultPath]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  const activeSession = useMemo(() => {
    if (!store.activeSessionId) {
      return null;
    }
    return findWizardSession(store, store.activeSessionId) ?? null;
  }, [store]);

  const ensureActiveSession = useCallback(
    (
      options?: Partial<Pick<WizardSession, "droppedCardIds" | "contextScope">>,
    ) => {
      if (!loaded) return null;

      if (store.activeSessionId) {
        const existing = findWizardSession(store, store.activeSessionId);
        if (existing) {
          return existing;
        }
      }

      const session = createWizardSession(options);
      commitStore((current) =>
        upsertWizardSession(
          { ...current, activeSessionId: session.id },
          session,
        ),
      );
      return session;
    },
    [commitStore, loaded, store],
  );

  const selectSession = useCallback(
    (sessionId: string) => {
      commitStore((current) => ({ ...current, activeSessionId: sessionId }));
    },
    [commitStore],
  );

  const createSession = useCallback(
    (
      options?: Partial<Pick<WizardSession, "droppedCardIds" | "contextScope">>,
    ) => {
      const session = createWizardSession(options);
      commitStore((current) =>
        upsertWizardSession(
          { ...current, activeSessionId: session.id },
          session,
        ),
      );
      return session.id;
    },
    [commitStore],
  );

  const updateActiveSession = useCallback(
    (patch: ActiveWizardSessionPatch) => {
      const sessionId = store.activeSessionId;
      if (!sessionId) return;

      commitStore((current) => {
        const existing = findWizardSession(current, sessionId);
        if (!existing) return current;

        const updated: WizardSession = {
          ...existing,
          ...patch,
          title: deriveSessionTitle(patch.messages),
          updatedAt: Date.now(),
        };
        return upsertWizardSession(current, updated);
      });
    },
    [commitStore, store.activeSessionId],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      commitStore((current) => removeWizardSession(current, sessionId));
    },
    [commitStore],
  );

  const archiveSession = useCallback(
    (sessionId: string) => {
      commitStore((current) => {
        let next = setWizardSessionStatus(current, sessionId, "archived");
        if (next.activeSessionId === sessionId) {
          const fallback = activeWizardSessions(next).find(
            (session) => session.id !== sessionId,
          );
          next = { ...next, activeSessionId: fallback?.id ?? null };
        }
        return next;
      });
    },
    [commitStore],
  );

  const unarchiveSession = useCallback(
    (sessionId: string) => {
      commitStore((current) =>
        setWizardSessionStatus(current, sessionId, "active"),
      );
    },
    [commitStore],
  );

  return {
    loaded,
    store,
    activeSession,
    activeSessionId: store.activeSessionId,
    activeSessions: activeWizardSessions(store),
    archivedSessions: archivedWizardSessions(store),
    ensureActiveSession,
    selectSession,
    createSession,
    updateActiveSession,
    deleteSession,
    archiveSession,
    unarchiveSession,
  };
}
