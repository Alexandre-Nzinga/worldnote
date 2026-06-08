import { describe, expect, it } from "vitest";
import {
  buildCardCreationPrompt,
  detectCardGenerationFollowUp,
  detectCardGenerationIntent,
} from "./detectCardGenerationIntent.js";

describe("detectCardGenerationIntent", () => {
  it("detects character card creation from natural language", () => {
    const intent = detectCardGenerationIntent(
      "Create a character card that is a wizard",
    );
    expect(intent).toEqual({
      cardType: "character",
      prompt: "Create a character card that is a wizard",
    });
  });

  it("detects archetype-only character requests", () => {
    const intent = detectCardGenerationIntent("make a wizard");
    expect(intent?.cardType).toBe("character");
  });

  it("detects explicit location cards", () => {
    const intent = detectCardGenerationIntent(
      "generate a location card for a mountain fortress",
    );
    expect(intent?.cardType).toBe("location");
  });

  it("defaults to character when only card is mentioned", () => {
    const intent = detectCardGenerationIntent("create a new card");
    expect(intent?.cardType).toBe("character");
  });

  it("ignores simulation and chat-only requests", () => {
    expect(
      detectCardGenerationIntent("Simulate a battle between Aria and Borin"),
    ).toBeNull();
    expect(
      detectCardGenerationIntent("What is the capital of this kingdom?"),
    ).toBeNull();
  });

  it("ignores dialogue generation prompts that mention characters", () => {
    expect(
      detectCardGenerationIntent(
        "Write a believable conversation between Tyrion Lannister and Tywin Lannister. Stay true to each character's personality, background, and relationships. Format it as a back-and-forth script.",
      ),
    ).toBeNull();
  });
});

describe("detectCardGenerationFollowUp", () => {
  it("merges detail follow-ups into a pending card request", () => {
    const intent = detectCardGenerationFollowUp("male, 300 years old", [
      { role: "user", content: "Create a character card that is a wizard" },
      {
        role: "assistant",
        content:
          "I'm sorry, but your request doesn't provide enough information.",
      },
    ]);
    expect(intent?.cardType).toBe("character");
    expect(intent?.prompt).toContain("wizard");
    expect(intent?.prompt).toContain("male, 300 years old");
  });
});

describe("buildCardCreationPrompt", () => {
  it("asks the model to invent missing details", () => {
    const prompt = buildCardCreationPrompt("create a wizard", []);
    expect(prompt).toContain("Invent every missing detail");
    expect(prompt).toContain("create a wizard");
  });
});
