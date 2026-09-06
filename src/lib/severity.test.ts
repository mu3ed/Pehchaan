import { describe, expect, it } from "vitest";
import { getSeverityTier } from "./severity";

describe("getSeverityTier", () => {
  const clearGates = { vision: false, hearing: false };

  it("prioritizes a vision referral as red", () => {
    expect(
      getSeverityTier({
        barrierCategory: "vision_hearing_referral",
        gateConcerns: { vision: true, hearing: false },
      }).tier
    ).toBe("red");
  });

  it("combines simultaneous vision and hearing concerns", () => {
    expect(
      getSeverityTier({
        barrierCategory: "vision_hearing_referral",
        gateConcerns: { vision: true, hearing: true },
      }).messageKey
    ).toBe("severity.red.both");
  });

  it("maps structured reading patterns to yellow", () => {
    for (const barrierCategory of [
      "dot_identity_pattern",
      "letter_position_pattern",
      "diacritic_pattern",
      "memorization_reliance",
    ] as const) {
      expect(getSeverityTier({ barrierCategory, gateConcerns: clearGates }).tier).toBe("yellow");
    }
  });

  it("maps no concerns to blue", () => {
    expect(
      getSeverityTier({ barrierCategory: "no_concerns", gateConcerns: clearGates }).tier
    ).toBe("blue");
  });

  it("keeps language mismatch as neutral context", () => {
    expect(
      getSeverityTier({ barrierCategory: "language_mismatch", gateConcerns: clearGates }).tier
    ).toBe("context");
  });

  it("orders red before yellow, context, and blue", () => {
    const tiers = [
      getSeverityTier({ barrierCategory: "no_concerns", gateConcerns: clearGates }),
      getSeverityTier({ barrierCategory: "language_mismatch", gateConcerns: clearGates }),
      getSeverityTier({ barrierCategory: "dot_identity_pattern", gateConcerns: clearGates }),
      getSeverityTier({ barrierCategory: "vision_hearing_referral", gateConcerns: clearGates }),
    ];
    expect(tiers.map((tier) => tier.priority)).toEqual([3, 2, 1, 0]);
  });

  it("uses a safe neutral fallback for unknown categories", () => {
    expect(
      getSeverityTier({ barrierCategory: "unknown", gateConcerns: clearGates }).tier
    ).toBe("context");
  });
});
