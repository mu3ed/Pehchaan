import type { SeverityInput, SeverityResult } from "../types";

const YELLOW_BARRIERS = new Set([
  "dot_identity_pattern",
  "letter_position_pattern",
  "diacritic_pattern",
  "memorization_reliance",
]);

export function getSeverityTier(input: SeverityInput): SeverityResult {
  const { barrierCategory, gateConcerns } = input;

  if (barrierCategory === "vision_hearing_referral") {
    if (gateConcerns.vision && gateConcerns.hearing) {
      return { tier: "red", priority: 0, labelKey: "severity.red.label", messageKey: "severity.red.both" };
    }
    if (gateConcerns.hearing) {
      return { tier: "red", priority: 0, labelKey: "severity.red.label", messageKey: "severity.red.hearing" };
    }
    return { tier: "red", priority: 0, labelKey: "severity.red.label", messageKey: "severity.red.vision" };
  }

  if (YELLOW_BARRIERS.has(barrierCategory)) {
    return { tier: "yellow", priority: 1, labelKey: "severity.yellow.label", messageKey: "severity.yellow.message" };
  }

  if (barrierCategory === "language_mismatch") {
    return { tier: "context", priority: 2, labelKey: "severity.context.label", messageKey: "severity.context.message" };
  }

  if (barrierCategory === "no_concerns") {
    return { tier: "blue", priority: 3, labelKey: "severity.blue.label", messageKey: "severity.blue.message" };
  }

  return { tier: "context", priority: 2, labelKey: "severity.context.label", messageKey: "severity.context.message" };
}
