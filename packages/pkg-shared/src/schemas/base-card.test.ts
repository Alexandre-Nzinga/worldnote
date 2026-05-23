import { describe, expect, it } from "vitest";
import { BaseCardSchema } from "./base-card.js";

describe("BaseCardSchema", () => {
  it("accepts minimal valid payload", () => {
    const parsed = BaseCardSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      custom_properties: {},
    });
    expect(parsed.success).toBe(true);
  });
});
