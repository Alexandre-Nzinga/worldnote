/** How long each WorldWizard prompt stays visible before advancing. */
export const WIZARD_PROMPT_CYCLE_INTERVAL_MS = 6_000;

/** Crossfade duration when switching prompts. */
export const WIZARD_PROMPT_CYCLE_FADE_MS = 400;

export const wizardPromptPlaceholders = [
  "What will you build today?",
  "What lore needs filling in?",
  "Who should appear in your world next?",
  "What place are you mapping today?",
  "What story thread should we weave?",
  "What character needs a backstory?",
] as const;
