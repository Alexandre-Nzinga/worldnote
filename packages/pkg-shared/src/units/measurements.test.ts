import { describe, expect, it } from "vitest";
import {
  canonicalMeasurementPropertyValue,
  detectMeasurementKind,
  formatMeasurementPropertyValue,
  formatMeasurementValue,
  normalizeCanonicalMeasurement,
  parseMeasurementInput,
  storesMeasurementAsString,
  toCanonicalValue,
} from "./measurements.js";

describe("detectMeasurementKind", () => {
  it("recognizes common property keys", () => {
    expect(detectMeasurementKind("Weight")).toBe("weight");
    expect(detectMeasurementKind("body_height")).toBe("height");
    expect(detectMeasurementKind("temp")).toBe("temperature");
    expect(detectMeasurementKind("attack_range")).toBe("distance");
    expect(detectMeasurementKind("max_speed")).toBe("speed");
    expect(detectMeasurementKind("color")).toBeNull();
  });
});

describe("formatMeasurementValue", () => {
  it("formats sub-kilogram weights in grams for metric", () => {
    expect(formatMeasurementValue(0.157, "weight", "metric")).toBe("157 g");
  });

  it("converts weight to pounds for imperial", () => {
    expect(formatMeasurementValue(1, "weight", "imperial")).toBe("2.2 lb");
  });

  it("formats height in feet and inches for imperial", () => {
    expect(formatMeasurementValue(180, "height", "imperial")).toBe(`5' 11"`);
  });

  it("formats distance in km and miles", () => {
    expect(formatMeasurementValue(1500, "distance", "metric")).toBe("1.5 km");
    expect(formatMeasurementValue(1609.344, "distance", "imperial")).toBe(
      "1 mi",
    );
  });

  it("formats speed in km/h and mph", () => {
    expect(formatMeasurementValue(100, "speed", "metric")).toBe("100 km/h");
    expect(formatMeasurementValue(100, "speed", "imperial")).toBe("62 mph");
  });
});

describe("parseMeasurementInput", () => {
  it("round-trips weight through imperial display units", () => {
    const canonical = parseMeasurementInput("2.2", "weight", "imperial");
    expect(canonical).toBeCloseTo(1, 2);
    expect(toCanonicalValue(2.2, "weight", "imperial")).toBeCloseTo(1, 2);
  });
});

describe("normalizeCanonicalMeasurement", () => {
  it("accepts non-negative numbers", () => {
    expect(normalizeCanonicalMeasurement(120)).toBe(120);
    expect(normalizeCanonicalMeasurement(0)).toBe(0);
    expect(normalizeCanonicalMeasurement("900")).toBe(900);
    expect(normalizeCanonicalMeasurement(" 42.5 ")).toBe(42.5);
  });

  it("rejects negative values", () => {
    expect(normalizeCanonicalMeasurement(-5)).toBeUndefined();
    expect(normalizeCanonicalMeasurement("-10")).toBeUndefined();
  });

  it("salvages the first positive number from prose", () => {
    expect(
      normalizeCanonicalMeasurement(
        "../../../../../../5000 km/h or more (depending on the size)",
      ),
    ).toBe(5000);
  });

  it("rejects non-numeric text without digits", () => {
    expect(normalizeCanonicalMeasurement("hyperspace transit")).toBeUndefined();
  });
});

describe("storesMeasurementAsString", () => {
  it("identifies string-backed measurement fields", () => {
    expect(storesMeasurementAsString("max_speed")).toBe(true);
    expect(storesMeasurementAsString("weight")).toBe(false);
  });
});

describe("formatMeasurementPropertyValue", () => {
  it("formats custom property rows with units", () => {
    expect(formatMeasurementPropertyValue("temperature", "21", "metric")).toBe(
      "21 °C",
    );
    expect(
      Number(
        canonicalMeasurementPropertyValue("temperature", "70", "imperial"),
      ),
    ).toBeCloseTo(21.1, 0);
  });
});
