import { describe, expect, it } from "vitest";
import {
  createWizardSession,
  deriveSessionTitle,
  emptyWizardSessionsStore,
  removeWizardSession,
  setWizardSessionStatus,
  upsertWizardSession,
} from "./wizardSessionStore.js";

describe("wizardSessionStore", () => {
  it("derives a title from the first user message", () => {
    expect(
      deriveSessionTitle([
        { id: "1", role: "user", content: "Create a wizard character" },
      ]),
    ).toBe("Create a wizard character");
  });

  it("creates and upserts sessions", () => {
    const session = createWizardSession();
    const store = upsertWizardSession(emptyWizardSessionsStore(), session);
    expect(store.sessions).toHaveLength(1);
    expect(store.sessions[0]?.id).toBe(session.id);
  });

  it("archives and removes sessions", () => {
    const session = createWizardSession();
    let store = upsertWizardSession(emptyWizardSessionsStore(), session);
    store = { ...store, activeSessionId: session.id };
    store = setWizardSessionStatus(store, session.id, "archived");
    expect(store.sessions[0]?.status).toBe("archived");
    store = removeWizardSession(store, session.id);
    expect(store.sessions).toHaveLength(0);
    expect(store.activeSessionId).toBeNull();
  });
});
